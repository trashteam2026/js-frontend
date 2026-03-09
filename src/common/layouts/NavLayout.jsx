import { Outlet } from 'react-router-dom';

import NavBar from '@/common/components/navigation/NavBar';
import styled from 'styled-components';

const Layout = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export default function NavLayout() {
  return (
    <Layout>
      <NavBar />
      <Outlet />
    </Layout>
  );
}
