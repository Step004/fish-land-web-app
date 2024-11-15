import { NavLink } from "react-router-dom";
import css from "./Hero.module.css";
import { FaArrowUpLong } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import img from "../../img/bgr-logo.png";

export default function Hero() {
  return (
    <section className={css.heroSection}>
      <div className={css.heroTitle}>
        <h1 className={css.heroTitleH1}>Make Life Easier for the Family:</h1>
        <h3 className={css.heroTitleH2}>
          Find Babysitters Online for All Occasions
        </h3>
        <NavLink to="/nannies" className={css.navLink}>
          Get started <FaArrowUpLong className={css.svgLink} />
        </NavLink>
      </div>
      <img src={img} alt="kid" className={css.heroImg} />
      <div className={css.expNan}>
        <div className={css.check}>
          <FaCheck className={css.check} />
        </div>
        <div className={css.expNanP}>
          <p className={css.expNanP1}>Experienced nannies</p>
          <p className={css.expNanP2}>15,000</p>
        </div>
      </div>
    </section>
  );
}
