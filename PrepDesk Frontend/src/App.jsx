import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Checklist from "./pages/Checklist";
import Diary from "./pages/Diary";
import Chat from "./pages/Chat";
import AddCourse from "./pages/AddCourse";
import RemoveCourse from "./pages/RemoveCourse";
import { Terms, Privacy } from "./pages/Legal";
export default function App() {
    return (<Routes>
      <Route path="/" element={<Landing />}/>
      <Route path="/role" element={<RoleSelect />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/auth/callback" element={<AuthCallback />}/>
      <Route path="/terms" element={<Terms />}/>
      <Route path="/privacy" element={<Privacy />}/>
      <Route element={<Layout role="student"/>}>
        <Route path="/home" element={<Home />}/>
        <Route path="/courses" element={<Courses />}/>
        <Route path="/checklist" element={<Checklist />}/>
        <Route path="/diary" element={<Diary />}/>
        <Route path="/chat" element={<Chat />}/>
      </Route>
      <Route element={<Layout role="educator"/>}>
        <Route path="/educator/add" element={<AddCourse />}/>
        <Route path="/educator/remove" element={<RemoveCourse />}/>
      </Route>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>);
}
