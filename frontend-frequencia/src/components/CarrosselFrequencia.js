import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import TelaBoasVindas from "./TelaBoasVindas";
import TelaInformacoes from "./TelaInformacoes";
import TelaGerarSaida from "./TelaGerarSaida";

export default function CarrosselFrequencia({ funcionario, onLogout }) {
  return (
    <Swiper
      pagination={{ clickable: true }}
      spaceBetween={30}
      slidesPerView={1}
      style={{ minHeight: "90vh" }}
      modules={[Pagination]}
      allowTouchMove
    >
      <SwiperSlide>
        <TelaBoasVindas funcionario={funcionario} onLogout={onLogout} />
      </SwiperSlide>
      <SwiperSlide>
        <TelaInformacoes />
      </SwiperSlide>
      <SwiperSlide>
        <TelaGerarSaida funcionario={funcionario} />
      </SwiperSlide>
    </Swiper>
  );
}
