import Navbar from './Navbar';
import GridList from './GridList';
import Search from './Search';
const Layout: React.FC = () => {
  return (
    <>
      <Navbar></Navbar>
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"></div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl bg-[#F6F6F6] px-4 py-8 sm:px-6 lg:px-8">
            <Search></Search>
          </div>
          <div className="mx-auto max-w-7xl bg-[#F6F6F6] px-4 py-8 sm:px-6 lg:px-8">
            <GridList />
          </div>
        </main>
      </div>
    </>
  );
};

export default Layout;
