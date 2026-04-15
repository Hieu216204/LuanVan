import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import hcmutLogo from "../../assets/HCMUT_official_logo.png";

const exportToPDF = async (rows, printRef) => {
  if (!rows || rows.length === 0) {
    alert("Không có dữ liệu để xuất báo cáo!");
    return;
  }

  const element = printRef.current;
  if (!element) {
    alert("Không tìm thấy khu vực cần xuất.");
    return;
  }

  try {
    const logoDataUrl = await (async () => {
      try {
        const response = await fetch(hcmutLogo);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Không thể đọc logo."));
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })();

    const headerImageDataUrl = await (async () => {
      const headerCanvas = document.createElement("canvas");
      headerCanvas.width = 1730;
      headerCanvas.height = 100;
      const ctx = headerCanvas.getContext("2d");
      if (!ctx) return null;
      const reportTitle = "Báo cáo Trạm bơm".normalize("NFC");
      const exportedAt = `Thời gian xuất: ${new Date().toLocaleString("vi-VN", { hour12: false })}`.normalize("NFC");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, headerCanvas.width, headerCanvas.height);

      if (logoDataUrl) {
        try {
          const logo = await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Không tải được logo."));
            img.src = logoDataUrl;
          });

          ctx.drawImage(logo, 24, 14, 72, 72);
        } catch {
          // Không render logo nếu lỗi, vẫn xuất được tiêu đề.
        }
      }

      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 44px 'Segoe UI', 'Tahoma', 'Arial Unicode MS', Arial, sans-serif";
      ctx.fillText(reportTitle, headerCanvas.width / 2, 42);

      ctx.fillStyle = "#6b7280";
      ctx.font = "400 28px 'Segoe UI', 'Tahoma', 'Arial Unicode MS', Arial, sans-serif";
      ctx.fillText(exportedAt, headerCanvas.width / 2, 76);

      return headerCanvas.toDataURL("image/png");
    })();

    const elementRect = element.getBoundingClientRect();
    const rowBottoms = Array.from(
      element.querySelectorAll(".ht-table tbody tr")
    )
      .map((row) => {
        const rect = row.getBoundingClientRect();
        return rect.bottom - elementRect.top;
      })
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Đảm bảo vùng bảng trong bản clone hiển thị toàn bộ để capture đủ dữ liệu.
        const clonedTableWrap = clonedDoc.querySelector(".ht-table-wrap");
        if (clonedTableWrap) {
          clonedTableWrap.style.maxHeight = "none";
          clonedTableWrap.style.overflow = "visible";
        }

        const clonedPrintArea = clonedDoc.querySelector(".ht-print-area");
        if (clonedPrintArea) {
          clonedPrintArea.style.maxHeight = "none";
          clonedPrintArea.style.overflow = "visible";
        }

        // Tránh lỗi lệch tiêu đề khi capture bảng dài.
        const clonedThead = clonedDoc.querySelector(".ht-table thead");
        if (clonedThead) {
          clonedThead.style.position = "static";
          clonedThead.style.top = "auto";
        }

        for (const cell of Array.from(
          clonedDoc.querySelectorAll(".ht-th-group.stt, .ht-td.stt")
        )) {
          cell.style.position = "static";
          cell.style.left = "auto";
          cell.style.zIndex = "auto";
        }

        // Ổn định kích thước tiêu đề cột khi render canvas nhiều trang.
        for (const headerCell of Array.from(
          clonedDoc.querySelectorAll(".ht-th-sub")
        )) {
          headerCell.style.fontSize = "13px";
          headerCell.style.fontWeight = "700";
          headerCell.style.lineHeight = "1.2";
          headerCell.style.whiteSpace = "nowrap";
          headerCell.style.transform = "none";
        }

        // html2canvas chưa hỗ trợ oklch(), thay bằng fallback sáng để tránh lỗi parse.
        const fallbackByProp = (prop) => {
          const p = String(prop || "").toLowerCase();
          if (p.includes("background")) return "#ffffff";
          if (p.includes("border")) return "#d1d5db";
          if (p.includes("shadow")) return "none";
          if (p === "color" || p.includes("color")) return "#111827";
          return null;
        };

        for (const sheet of Array.from(clonedDoc.styleSheets || [])) {
          try {
            const rules = sheet.cssRules;
            if (!rules) continue;

            for (const rule of Array.from(rules)) {
              if (!rule.style) continue;

              for (const prop of Array.from(rule.style)) {
                const val = rule.style.getPropertyValue(prop);
                if (!val || !val.includes("oklch(")) continue;

                const fallback = fallbackByProp(prop);
                if (fallback) {
                  rule.style.setProperty(prop, fallback);
                } else {
                  rule.style.removeProperty(prop);
                }
              }
            }
          } catch (e) {
            // Ignore stylesheet access errors (CORS/protected styles).
          }
        }
      }
    });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const margin = 10;
    const headerHeight = 16;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const contentY = margin + headerHeight;
    const contentHeight = pageHeight - contentY - margin;

    const drawPdfHeader = () => {
      if (headerImageDataUrl) {
        pdf.addImage(headerImageDataUrl, "PNG", margin, margin, contentWidth, headerHeight);
      }
    };

    // Quy đổi chiều cao mỗi trang PDF sang pixel trên canvas để cắt ảnh theo trang.
    const pageHeightInPx = Math.max(1, Math.floor((contentHeight * canvas.width) / contentWidth));
    const pxPerDomPx = canvas.height / Math.max(element.scrollHeight, 1);
    const rowBottomsInCanvas = rowBottoms
      .map((v) => Math.round(v * pxPerDomPx))
      .filter((v) => Number.isFinite(v) && v > 0)
      .sort((a, b) => a - b);

    const calcEndY = (startY) => {
      const defaultEnd = Math.min(startY + pageHeightInPx, canvas.height);
      if (defaultEnd >= canvas.height) {
        return canvas.height;
      }

      let safeEnd = 0;
      for (const bottom of rowBottomsInCanvas) {
        if (bottom <= startY + 20) continue;
        if (bottom <= defaultEnd) {
          safeEnd = bottom;
        } else {
          break;
        }
      }

      if (!safeEnd) {
        return defaultEnd;
      }

      const slice = safeEnd - startY;
      if (slice < pageHeightInPx * 0.35) {
        return defaultEnd;
      }

      return Math.min(safeEnd + 1, defaultEnd);
    };

    let offsetY = 0;
    let pageIndex = 0;

    while (offsetY < canvas.height) {
      const endY = calcEndY(offsetY);
      const sliceHeight = endY - offsetY;
      if (sliceHeight <= 0) {
        break;
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const ctx = pageCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("Không thể khởi tạo canvas để tách trang.");
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        sliceHeight,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height
      );

      const pageImage = pageCanvas.toDataURL("image/png");
      const renderedHeight = (sliceHeight * contentWidth) / canvas.width;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      drawPdfHeader();
      pdf.addImage(pageImage, "PNG", margin, contentY, contentWidth, renderedHeight);

      offsetY = endY;
      pageIndex += 1;
    }

    pdf.save("bao-cao.pdf");
  } catch (error) {
    console.error("Lỗi xuất PDF:", error);
    alert(`Đã xảy ra lỗi: ${error.message}`);
  }
};

export default exportToPDF;