import styled from "styled-components";
import { Layout, Menu } from "antd";

const { Header, Footer } = Layout;

export const StyledHeader = styled(Header)`

:where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-item-selected, :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-item-selected, :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-submenu-selected, :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-submenu-selected {
    color: #42005A !important;
    background-color: transparent !important;
}
:where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-item-selected::after, :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-item-selected::after, :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-submenu-selected::after, :where(.css-dev-only-do-not-override-xex5fb).ant-menu-light>.ant-menu.ant-menu-horizontal >.ant-menu-submenu-selected::after {
    border-bottom-width: 2px !important;
    border-bottom-color: #42005A !important;
}

:where(.css-dev-only-do-not-override-xex5fb).ant-menu-light.ant-menu-horizontal >.ant-menu-item:hover::after{
    border-bottom-width: 2px !important; 
    border-bottom-color: #42005A !important;
}
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  
`;

export const StyledMenu = styled(Menu)`
  flex: 1;
  border-bottom: none;
  background: transparent;
  font-weight: 600;
  justify-content: center;
  margin-right: 50px;
  
  .ant-menu-item {
    color: #002140 !important;
    transition: all 0.3s ease;
    padding: 0 20px;
  }

`;

export const StyledFooter = styled(Footer)`
  text-align: center;
  background: #f0f2f5;
  padding: 15px;
  font-weight: 500;
  color: #002140;
`;
