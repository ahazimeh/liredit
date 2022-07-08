import { withUrqlClient } from "next-urql";
import React from "react";
import { createUrlqClient } from "../../../util/createUrqlClient";

const EditPost = ({}) => {
  return <div>hello</div>;
};

export default withUrqlClient(createUrlqClient)(EditPost);
