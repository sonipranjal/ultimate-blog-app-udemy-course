import React from "react";
import MainSection from "../components/MainSection";
import SideSection from "../components/SideSection";

import WriteFormModal from "../components/WriteFormModal";
import MainLayout from "../layouts/MainLayout";

const HomePage = () => {
  return (
    <MainLayout>
      <section className="grid grid-cols-12">
        <MainSection />
        <SideSection />
      </section>
      <WriteFormModal />
    </MainLayout>
  );
};

export default HomePage;
