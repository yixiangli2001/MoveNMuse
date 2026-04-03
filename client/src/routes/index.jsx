// Shirley, Xinyi, Jiayu, Marina
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import Layout from "../Layout";
import StaffRoute from "./StaffRoute.jsx";
import RoomManagement from "../pages/RoomManagement.jsx";
import { useAuth } from "../components/auth/AuthContext.jsx";
import {
  Home,
  Account,
  Login,
  CartPage,
  Checkout,
  Payment,
  PaymentHistory,
  AddPaymentDetail,
  PaymentSuccess,
  RoomView,
  RoomDetail,
  CourseList,
  CourseDetail,
  BookingDetails,
  SessionList, 
  SessionForm,
  StaffSessionsPage,
  StaffCoursesPage,
  CourseForm,
  StaffInstructorsPage,
  InstructorForm,
  SignUp,
  ChangePassword,
  ManagePaymentMethods,
  Instructors,
  InstructorDetail,
  Terms,
  Privacy
} from "../pages";

function RoomsGate() {
  const { user } = useAuth();
  const isStaff = user?.role === "staff" || user?.role === "admin";
  return isStaff ? <Navigate to="/admin/rooms" replace /> : <RoomView />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="account" element={<Account />} />
        <Route path="login" element={<Login />} />
        <Route path="signUp" element={<SignUp />} />
        <Route path="changePassword" element={<ChangePassword />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment" element={<Payment />} />
        <Route path="managePaymentMethods" element={<ManagePaymentMethods />} />
        <Route path="paymentHistory" element={<PaymentHistory />} />
        <Route path="addPaymentDetail" element={<AddPaymentDetail />} />
        <Route path="paymentSuccess" element={<PaymentSuccess />} />
        <Route path="rooms" element={<RoomView />} />
        <Route path="rooms/:id" element={<RoomDetail />} />
        <Route path="courses" element={<CourseList />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="instructors" element={<Instructors />} />
        <Route path="instructors/:id" element={<InstructorDetail />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="/sessions" element={<SessionList />} />
        <Route path="/sessions/new" element={<SessionForm />} />
        <Route path="/sessions/:id/edit" element={<SessionForm />} />
        <Route path="/admin/sessions" element={<StaffSessionsPage />} />
        <Route path="/admin/sessions/new" element={<SessionForm />} />
        <Route path="/admin/sessions/:id/edit" element={<SessionForm />} /> 
        <Route path="/admin/courses" element={<StaffCoursesPage />} />
        <Route path="/admin/courses/new" element={<CourseForm />} />
        <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
        <Route path="/admin/instructors" element={<StaffInstructorsPage />} />
        <Route path="/admin/instructors/new" element={<InstructorForm />} />
        <Route path="/admin/instructors/:id/edit" element={<InstructorForm />} />

        <Route path="/account/bookings/:bookingId" element={<BookingDetails />} />

        <Route element={<StaffRoute />}>
        <Route path="admin/rooms" element={<RoomManagement />} />
        </Route>
      </Route>
    </Route>
  )
);

export { router };
