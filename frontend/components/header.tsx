import React from "react";

const Header = () => {
  return (
    <div className="border-b p-2 flex items-center justify-between ">
      <img
        src="/logo.png"
        alt="Logo"
        style={{ height: "auto", width: "50px" }}
      />
    </div>
  );
};

export default Header;
