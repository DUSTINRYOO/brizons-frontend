import type { NextPage } from "next";
import Button from "../../components/button";
import Layout from "../../components/layout";

const Write: NextPage = () => {
  return (
    <Layout canGoBack title="Write Post">
      <form className="space-y-4 p-4">
        <Button text="Submit" />
      </form>
    </Layout>
  );
};

export default Write;
