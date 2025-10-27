import React from "react";
import "./loading.css";

const Loading = () => {
  return (
    <section className="spinner-container bg-white dark:bg-black w-full h-full flex items-center justify-center">
      <div className="spinner">
        <span className="spinner__leter" letter="L">
          L
        </span>
        <span className="spinner__leter" letter="o">
          o
        </span>
        <span className="spinner__leter" letter="a">
          a
        </span>
        <span className="spinner__leter" letter="d">
          d
        </span>
        <span className="spinner__leter" letter="i">
          i
        </span>
        <span className="spinner__leter" letter="n">
          n
        </span>
        <span className="spinner__leter" letter="g">
          g
        </span>
      </div>
    </section>
  );
};

export default Loading;
