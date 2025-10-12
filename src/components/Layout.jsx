import React, { useState, useEffect } from "react";
import styled from "styled-components";
import logo from "../assets/logotinsa.png";
import { useNavigate } from "react-router-dom";
import { 
  InboxOutlined, 
  FilterOutlined, 
  BarChartOutlined, 
  DollarOutlined, 
  ProjectOutlined, 
  LineChartOutlined, 
  ApartmentOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { Layout, Menu } from "antd";
import { GrLogin } from "react-icons/gr";
import SessionTimeout from './SessionTimeout';

const { Header, Content, Footer } = Layout;

// Styled components définis directement dans le fichier
const StyledHeader = styled(Header)`
  /* Styles pour les éléments sélectionnés du menu */
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-item-selected, 
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-item-selected, 
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-submenu-selected, 
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-submenu-selected {
    color: #42005A;
    background-color: transparent;
  }
  
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-item-selected::after, 
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-item-selected::after, 
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-submenu-selected::after, 
  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-submenu-selected::after {
    border-bottom-width: 2px;
    border-bottom-color: #42005A;
  }

  :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-item:hover::after {
    border-bottom-width: 2px;
    border-bottom-color: #42005A;
  }
  
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  border-bottom: none;
  background: transparent;
  font-weight: 600;
  justify-content: center;
  margin-right: 50px;
  
  .ant-menu-item {
    color: #002140;
    transition: all 0.3s ease;
    padding: 0 20px;
  }
`;

const StyledFooter = styled(Footer)`
  text-align: center;
  background: #f0f2f5;
  padding: 15px;
  font-weight: 500;
  color: #002140;
`;

const CustomLayout = ({ children }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(localStorage.getItem("activemenuitem") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  // Mettre à jour le rôle utilisateur quand il change
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (current) {
      navigate(current);
    }
  }, [current, navigate]);

  // Items de menu de base
  const baseItems = [
    { label: "Autorisation", key: "/Autorisation", icon: <ApartmentOutlined /> },
    { label: "Stock", key: "/Stock", icon: <InboxOutlined /> },
    { label: "Commercialisation", key: "/Commercialisation", icon: <DollarOutlined /> },
    { label: "Technique", key: "/Technique", icon: <ProjectOutlined /> },
  ];

  const items = (userRole === 'superadmin' || userRole === 'validateur')
    ? [
        ...baseItems, 
        { 
          label: "Temoin", 
          key: "/Temoins", 
          icon: <SettingOutlined /> 
        }
      ]
    : baseItems;

  const onClickMenu = (e) => {
    localStorage.setItem("activemenuitem", e.key);
    setCurrent(e.key);
    navigate(e.key);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); 
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("activemenuitem");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("lastActivity");
    localStorage.setItem("logoutMessage", "Vous avez été déconnecté avec succès.");
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SessionTimeout />
      
      {/* 📌 NAVBAR */}
      <StyledHeader>
        {/* 📌 LOGO */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Logo" style={{ height: "80px" }} />
        </div>

        {/* 📌 MENU NAVIGATION */}
        <StyledMenu 
          mode="horizontal" 
          selectedKeys={[current]} 
          onClick={onClickMenu} 
          items={items} 
        />

        {/* 📌 DÉCONNEXION */}
        <div 
          style={{ 
            color: "#002140", 
            fontWeight: 600, 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "6px",
            transition: "background-color 0.3s ease"
          }}
          onClick={handleLogout}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
        >
          <GrLogin style={{ fontSize: "20px", color: "#42005A" }} />
          <span style={{ fontSize: "14px" }}>Déconnexion</span>
        </div>
      </StyledHeader>

      <Layout>
        {/* 📌 CONTENU PRINCIPAL */}
        <Content>
          <div style={{ background: "#ffffff" }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;