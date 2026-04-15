import { MainLayout } from "./MainLayout"

export default function mainLayout({ children, title }) {
    return <MainLayout title={title}>{children}</MainLayout>
}