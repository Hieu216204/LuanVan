import { Fragment, useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import routes from "./Routes/index.jsx"
import { mainLayout } from "./components/Layout"
import "./App.css"

function App() {
    return (
        <Routes>
            {routes.map((route) => {
                const Component = route.Component
                const MainComponentLayout = route.mainLayout ? mainLayout : null
                return (
                    <Fragment key={route.path}>
                        <Route
                            path={route.path}
                            element={
                                MainComponentLayout ? (
                                    <MainComponentLayout title={route.Title}>
                                        <Component />
                                    </MainComponentLayout>
                                ) : (
                                    <Component />
                                )
                            }
                        />
                    </Fragment>
                )
            })}
        </Routes>
    )
}

export default App