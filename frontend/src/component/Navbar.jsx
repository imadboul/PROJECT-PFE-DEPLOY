import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export default function Navbar() {

  const { logout, user } = useContext(AuthContext);
  const { notifications } = useNotifications();

  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkStyle = ({ isActive }) =>
    `px-3 py-2 text-lg ${isActive ? "text-orange-500 font-medium" : "text-white font-medium"
    } hover:text-orange-500`;

  const unreadCount = notifications.filter(n => !n.viewed).length;

  return (
    <nav className="px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <NavLink to="/Home" className="flex items-center gap-2 font-semibold">
        <img src="/logo-sonatrach-white-text.svg" className="w-8 h-8" />
        <span className="text-white font-bold text-xl">Sonatrach</span>
      </NavLink>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-4">
        {["admin", "superAdmin"].includes(user?.role) && (
        <NavLink to="/ContractClient" className={linkStyle}>
          Contracts
        </NavLink>
        )}
        {["client"].includes(user?.role) && (
        <NavLink to="/Contracts" className={linkStyle}>
          Contract
        </NavLink>
        )}
        <NavLink to="/Balance" className={linkStyle}>
          Balance
        </NavLink>
        {["admin", "superAdmin"].includes(user?.role) && (
          <NavLink to="/Bills" className={linkStyle}>
          Bills
        </NavLink>
        )}
        {["client"].includes(user?.role) && (
        <NavLink to="/order" className={linkStyle}>
          Orders
        </NavLink>
        )}
        
        <NavLink to="/Invoices" className={linkStyle}>
          Invoices
        </NavLink>
        <NavLink to="/product" className={linkStyle}>
          Product
        </NavLink>
        {["admin", "superAdmin"].includes(user?.role) && (
          <NavLink to="/Sign" className={linkStyle}>
            Sign Up
          </NavLink>
        )}
        <NavLink to="/" onClick={logout} className={linkStyle}>
          Logout
        </NavLink>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4 ">
        <div className="hidden md:block">
          {/* add product for superAdmin */}
          <NavLink
            to="/AddProduct"
            className={linkStyle}>
            {["admin", "superAdmin"].includes(user?.role) && (
              <i className="fa-solid fa-plus"></i>
            )}
          </NavLink>

          <NavLink to="/notifications" className={linkStyle}>
            <i className="fa-regular fa-message"></i>

            {unreadCount > 0 && (
              <span className="absolute text-xs bg-orange-500 text-white px-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>


        </div>

        {/* mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="text-xl text-white cursor-pointer hover:text-orange-500 md:hidden"
        >
          <i className="fa-solid fa-bars"></i>
        </button>


        {/* Menu (optional dropdown - language) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-xl text-white cursor-pointer hover:text-orange-500 hidden md:block"
        >
          <i className="fa-solid fa-language"></i>
        </button>

        {mobileOpen && (
          <div className="absolute right-3 top-12 border rounded shadow-md flex flex-col">
            <button className="px-4 py-2 cursor-pointer text-white hover:bg-white/10 flex items-center gap-2">
              <i className="fa-solid text-blue-300 fa-language"></i> FR
            </button>

            <button className="px-4 py-2 cursor-pointer text-white hover:bg-white/10 flex items-center gap-2">
              <i className="fa-solid text-blue-300 fa-language"></i> AR
            </button>
          </div>
        )}
      </div>

      {/* MOBILE FULL MENU */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-black/70 border-t shadow-md md:hidden flex flex-col p-4 gap-2 z-50">
          <NavLink
            onClick={() => setOpen(!open)}
            to="/Contracts"
            className={linkStyle}
          >
            Contracts
          </NavLink>
          <NavLink
            onClick={() => setOpen(!open)}
            to="/Balance"
            className={linkStyle}
          >
            Balance
          </NavLink>
          <NavLink
            onClick={() => setOpen(!open)}
            to="/Bills"
            className={linkStyle}
          >
            Bills
          </NavLink>
          <NavLink
            onClick={() => setOpen(!open)}
            to="/Invoices"
            className={linkStyle}
          >
            Invoices
          </NavLink>
          <NavLink
            onClick={() => setOpen(!open)}
            to="/product"
            className={linkStyle}
          >
            Product
          </NavLink>
          {["admin", "superAdmin"].includes(user?.role) && (
            <NavLink
              onClick={() => setOpen(!open)}
              to="/Sign"
              className={linkStyle}>
              Sign Up
            </NavLink>
          )}

          <NavLink

            onClick={() => setOpen(!open)}
            to="/AddProduct"
            className={linkStyle}>
            {["admin", "superAdmin"].includes(user?.role) && (
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-plus"></i>
                Add Product
              </div>
            )}
          </NavLink>


          {/* Message */}

          <NavLink
            to="/notifications"
            onClick={() => setOpen(!open)}
            className={linkStyle}
          >
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-message"></i>
              Messages
              {unreadCount > 0 && (
                <span className="absolute text-xs bg-orange-500 text-white px-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </NavLink>

          {/* Language */}
          <NavLink
            onClick={() => setOpen(!open)}
            to="#"
            className="px-3 py-2 hover:text-orange-500 text-white flex items-center gap-2"
          >
            <i className="fa-solid text-blue-300 fa-language"></i> FR
          </NavLink>

          <NavLink
            onClick={() => setOpen(!open)}
            to="#"
            className="px-3 py-2 hover:text-orange-500 text-white flex items-center gap-2"
          >
            <i className="fa-solid text-blue-300 fa-language"></i> AR
          </NavLink>

          {/* Logout */}
          <NavLink
            to="/"
            onClick={logout}
            className="px-3 py-2 text-white hover:text-orange-500 flex items-center gap-2"
          >
            Logout
          </NavLink>
        </div>
      )}
    </nav>
  );
}
