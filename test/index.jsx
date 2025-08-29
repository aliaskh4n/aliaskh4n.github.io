import React from "react";
import rectangle8 from "./rectangle-8.png";
import rectangle9 from "./rectangle-9.png";
import rectangle10 from "./rectangle-10.png";
import rectangle11 from "./rectangle-11.png";
import rectangle12 from "./rectangle-12.png";
import rectangle13 from "./rectangle-13.png";
import "./style.css";
import vector from "./vector.svg";

export const Frame = () => {
  return (
    <div className="frame">
      <div className="div">
        <div className="overlap">
          <div className="search">
            <img className="vector" alt="Vector" src={vector} />
          </div>
        </div>

        <div className="overlap-group">
          <img className="rectangle" alt="Rectangle" src={rectangle8} />

          <div className="text-wrapper">Убийство Игрока</div>
        </div>

        <div className="overlap-2">
          <div className="text-wrapper-2">Призванный в параллел...</div>

          <img className="rectangle" alt="Rectangle" src={rectangle9} />
        </div>

        <div className="overlap-3">
          <img className="rectangle" alt="Rectangle" src={rectangle10} />

          <div className="text-wrapper-3">Смертельная красота</div>
        </div>

        <div className="overlap-4">
          <div className="text-wrapper">Руна Возмездия</div>

          <img className="rectangle" alt="Rectangle" src={rectangle11} />
        </div>

        <div className="rectangle-wrapper">
          <img className="img" alt="Rectangle" src={rectangle12} />
        </div>

        <div className="img-wrapper">
          <img className="img" alt="Rectangle" src={rectangle13} />
        </div>
      </div>
    </div>
  );
};
