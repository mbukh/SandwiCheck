import nextImg from "../../assets/images/icons/arrow-next.svg";
import prevImg from "../../assets/images/icons/arrow-previous.svg";

const SwiperNavigationButton = ({ navigation, swiperRef, direction }) => {
    const isNext = direction === "next";

    const srcImage = isNext ? nextImg : prevImg;

    const clickHandler = isNext
        ? () => swiperRef.current.slideNext()
        : () => swiperRef.current.slidePrev();

    const directionName = isNext ? "next" : "previous";

    const className = isNext ? "swiper-button-next" : "swiper-button-prev";

    const nextDisabled = !navigation.next ? "swiper-button-disabled" : "";
    const prevDisabled = !navigation.prev ? "swiper-button-disabled" : "";
    const disabledStyle = isNext ? nextDisabled : prevDisabled;

    const swiperNavigationButtonStyle =
        "btn-wrapper lg:hidden w-10 md:w-15 h-10 md:h-15 -mt-9 md:-mt-11 no-select no-drag";

    return (
        <button
            className={`${className} ${swiperNavigationButtonStyle} ${disabledStyle}`}
            onClick={clickHandler}
        >
            <img
                className="w-full h-full"
                src={srcImage}
                alt={`Go to ${directionName} slide`}
                width="120"
                height="120"
            />
        </button>
    );
};

export default SwiperNavigationButton;
