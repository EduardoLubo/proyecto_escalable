import { Sidebar } from 'flowbite-react';
import React from 'react';
import SimpleBar from 'simplebar-react';
import FullLogo from '../shared/logo/FullLogo';
import NavItems from './NavItems';
import SidebarContent from './Sidebaritems';
import { isAdmin } from '../../../components/protection/isAdmin';

const SidebarLayout = () => {

  const admin = isAdmin();

  const filteredSidebar = SidebarContent
    .filter(section => {
      // Si la sección tiene roles, la filtramos según admin o no
      if (section.roles && section.roles.includes("ADMINISTRADOR")) {
        return admin; // solo admin la verá
      }
      return true; // el resto visible para todos
    })
    .map(section => ({
      ...section,
      children: section.children.filter(child => {
        if (child.roles && child.roles.includes("ADMINISTRADOR")) {
          return admin;
        }
        return true;
      }),
    }));

  return (
    <>
      <div className="xl:block hidden">
        <Sidebar
          className="fixed menu-sidebar  bg-white dark:bg-darkgray rtl:pe-4 rtl:ps-0 "
          aria-label="Sidebar with multi-level dropdown example"
        >
          <div className="px-6 py-4 flex items-center sidebarlogo">
            <FullLogo />
          </div>
          {/* 230 */}
          <SimpleBar className="h-[calc(100vh_-_100px)]">
            <Sidebar.Items className="px-5 mt-2">
              <Sidebar.ItemGroup className="sidebar-nav hide-menu">
                {filteredSidebar &&
                  filteredSidebar?.map((item, index) => (
                    <div className="caption" key={item.heading}>
                      <React.Fragment key={index}>
                        <h5 className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs pb-2 uppercase">
                          {item.heading}
                        </h5>
                        {item.children?.map((child, index) => (
                          <React.Fragment key={child.id && index}>
                            <NavItems item={child} />
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    </div>
                  ))}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;
