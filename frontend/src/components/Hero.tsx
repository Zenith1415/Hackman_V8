"use client";
import Image from "next/image";
import { Nosifer, Jolly_Lodger, Poppins } from "next/font/google";
import { useEffect, useRef } from "react";
import Navigation from "./Navigation";
const nosifer = Nosifer({ weight: "400", subsets: ["latin"] });
const jolly = Jolly_Lodger({ weight: "400", subsets: ["latin"] });
const poppins = Poppins({ weight: ["400"], subsets: ["latin"] });
export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          } else {
            entry.target.classList.remove("animate-in");
          }
        });
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes fly {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-15px) translateX(5px) rotate(2deg); }
          50% { transform: translateY(-5px) translateX(-5px) rotate(-1deg); }
          75% { transform: translateY(-10px) translateX(3px) rotate(1deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); }
        }
        @keyframes ghostFloat {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-10px) translateX(5px) scale(1.02); }
          66% { transform: translateY(-5px) translateX(-3px) scale(0.98); }
        }
        @keyframes batFloat {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-8px) translateX(3px) rotate(5deg); }
          50% { transform: translateY(-12px) translateX(-2px) rotate(-3deg); }
          75% { transform: translateY(-6px) translateX(4px) rotate(2deg); }
        }
        @keyframes fadeInUp {
          0% { 
            opacity: 0;
            transform: translateY(30px);
          }
          100% { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes houseGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 5px rgba(255, 120, 0, 0.3)); }
          50% { filter: brightness(1.1) drop-shadow(0 0 15px rgba(255, 120, 0, 0.6)); }
        }
        @keyframes dateGlow {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(255, 7, 0, 0.6),
              0 0 40px rgba(254, 119, 45, 0.4),
              inset 0 0 20px rgba(255, 7, 0, 0.2);
            transform: scale(1);
          }
          50% { 
            box-shadow: 
              0 0 30px rgba(255, 7, 0, 0.8),
              0 0 60px rgba(254, 119, 45, 0.6),
              inset 0 0 30px rgba(255, 7, 0, 0.3);
            transform: scale(1.02);
          }
        }
        @keyframes textShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes cornerPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
            box-shadow: 0 0 10px rgba(255, 7, 0, 0.6);
          }
          50% { 
            transform: scale(1.3);
            opacity: 1;
            box-shadow: 0 0 20px rgba(255, 7, 0, 1);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fly {
          animation: fly 8s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
        .animate-ghost-float {
          animation: ghostFloat 5s ease-in-out infinite;
        }
        .animate-bat-float {
          animation: batFloat 3s ease-in-out infinite;
        }
        .animate-bat-float-delay-1 {
          animation: batFloat 3.5s ease-in-out infinite 0.2s;
        }
        .animate-bat-float-delay-2 {
          animation: batFloat 4s ease-in-out infinite 0.4s;
        }
        .animate-house-glow {
          animation: houseGlow 8s ease-in-out infinite;
        }
        .animate-date-glow {
          animation: dateGlow 3s ease-in-out infinite;
        }
        .animate-text-shimmer {
          background: linear-gradient(90deg, #FE772D, #FF0700, #FE772D, #FF0700);
          background-size: 200% 100%;
          animation: textShimmer 2s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .animate-corner-pulse {
          animation: cornerPulse 2s ease-in-out infinite;
        }
        .animate-in .hero-title {
          animation: fadeInUp 1.2s ease-out forwards;
        }
        .animate-in .hero-subtitle {
          animation: fadeInUp 1.2s ease-out 0.3s forwards;
        }
        .animate-in .hero-button {
          animation: fadeInUp 1.2s ease-out 0.6s forwards;
        }
        .animate-in .hero-text {
          animation: fadeInUp 1.2s ease-out 0.9s forwards;
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
      `}</style>
      <section
        ref={sectionRef}
        className="mb-20 lg:mb-0 md:mb-0 sm:mb-0 relative w-full min-h-[90vh] h-[80vh] sm:min-h-[120vh] sm:h-screen bg-cover bg-center -mt-[1px] overflow-hidden"
        style={{
          backgroundImage: "url('/Hero/hero-bg.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        {}
        <div>
          <Image
            src="/Hero/botton.png"
            alt=""
            width={1450}
            height={20}
            className="
              absolute
              bottom-[-33%] sm:bottom-[-25%] md:bottom-[-25%] lg:bottom-[-25%]
              left-[0%] 
              right-[0%]
              h-[72.5%] sm:h-[72.5%] md:h-[68%] lg:h-[72.5%]
              w-[100%] 
              object-contain
            "
          />
          <Image
            src="/Hero/house.png"
            alt=""
            width={490}
            height={20}
            className="
              absolute
              bottom-[-18%] sm:bottom-[-10%] md:bottom-[-5%] lg:bottom-[62px]
              left-[-2%] sm:left-[2%] md:left-[2%] lg:left-[1.9%]
              h-[72.5%] sm:h-[70%] md:h-[68%] lg:h-[72.5%]
              w-[60vw] sm:w-[32vw] md:w-[32vw] lg:w-[32vw]
              object-contain
            "
          />
          <Image 
            src="/Hero/witch.png" 
            alt="" 
            width={70} 
            height={20} 
            className="absolute size-10 sm:size-auto right-[220px] top-[calc(6.5vh+140px)] sm:right-155 sm:top-54 animate-fly" 
          /> 
          <Image 
            src="/Hero/witch.png" 
            alt="" 
            width={70} 
            height={20} 
            className="absolute size-10 sm:size-auto right-[30px] top-[calc(6.5vh+100px)] sm:right-50 sm:top-32 animate-fly" 
          /> 
          <Image 
            src="/Hero/moon.png" 
            alt="" 
            width={90} 
            height={20} 
            className="absolute right-[25%] top-[calc(6.5vh+20%)] sm:right-73 sm:top-[10%] w-[13%] animate-float" 
          />
          <Image 
            src="/Hero/pumpkin evil.png" 
            alt="" 
            width={92} 
            height={20} 
            className="hidden sm:block absolute sm:right-18 md:right-18 lg:right-18 sm:bottom-0 md:bottom-0 lg:bottom-0 sm:h-[12%] md:h-[12%] lg:h-[12%] animate-pulse" 
          />
          <Image 
            src="/Hero/Vector.png" 
            alt="" 
            width={30} 
            height={20} 
            className="hidden sm:block absolute sm:bottom-[16%] md:bottom-[16%] lg:bottom-[16%] sm:right-[43%] md:right-[43%] lg:right-[43%] animate-bat-float" 
          />
          <Image 
            src="/Hero/Vector-4.png" 
            alt="" 
            width={40} 
            height={20} 
            className="hidden sm:block absolute sm:bottom-[16%] md:bottom-[16%] lg:bottom-[16%] sm:right-[44%] md:right-[44%] lg:right-[44%] animate-bat-float-delay-1" 
          />
          <Image 
            src="/Hero/Vector-7.png" 
            alt="" 
            width={35} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[17.5%] md:bottom-[17.5%] lg:bottom-[17.5%] sm:right-[41.5%] md:right-[41.5%] lg:right-[41.5%] animate-bat-float-delay-2" 
          />
          <Image 
            src="/Hero/Vector-2.png" 
            alt="" 
            width={30} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[17.5%] md:bottom-[17.5%] lg:bottom-[17.5%] sm:right-[40%] md:right-[40%] lg:right-[40%] animate-bat-float" 
          />
          <Image 
            src="/Hero/Vector-1.png" 
            alt="" 
            width={20} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[17.5%] md:bottom-[17.5%] lg:bottom-[17.5%] sm:right-[39%] md:right-[39%] lg:right-[39%] animate-bat-float-delay-1" 
          />
          <Image 
            src="/Hero/ghost.png" 
            alt="" 
            width={85} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[16%] md:bottom-[16%] lg:bottom-[16%] sm:right-[35%] md:right-[35%] lg:right-[35%] animate-ghost-float" 
          />
          <Image 
            src="/Hero/Vector-3.png" 
            alt="" 
            width={55} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[13%] md:bottom-[13%] lg:bottom-[13%] sm:right-[36%] md:right-[36%] lg:right-[36%] animate-bat-float-delay-2" 
          />
          <Image 
            src="/Hero/Vector-5.png" 
            alt="" 
            width={30} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[17.5%] md:bottom-[17.5%] lg:bottom-[17.5%] sm:right-[34%] md:right-[34%] lg:right-[34%] animate-bat-float" 
          />
          <Image 
            src="/Hero/Vector-8.png" 
            alt="" 
            width={25} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[13%] md:bottom-[13%] lg:bottom-[13%] sm:right-[32.5%] md:right-[32.5%] lg:right-[32.5%] animate-bat-float-delay-1" 
          />
          <Image 
            src="/Hero/Vector-6.png" 
            alt="" 
            width={35} 
            height={10} 
            className="hidden sm:block absolute sm:bottom-[14%] md:bottom-[14%] lg:bottom-[14%] sm:right-[28%] md:right-[28%] lg:right-[28%] animate-bat-float-delay-2" 
          />
            {}
            <Image 
            src="/Hero/pumpkin evil.png" 
            alt="" 
            width={92} 
            height={20} 
            className="block sm:hidden size-10 absolute right-1 bottom-10 animate-pulse" 
          />
          <Image 
            src="/Hero/Vector.png" 
            alt="" 
            width={30} 
            height={20} 
            className="block sm:hidden size-10 absolute bottom-10 right-[13%] animate-bat-float" 
          />
          <Image 
            src="/Hero/Vector-4.png" 
            alt="" 
            width={40} 
            height={20} 
            className="block sm:hidden size-10 absolute bottom-10 right-[14%] animate-bat-float-delay-1" 
          />
          <Image 
            src="/Hero/Vector-7.png" 
            alt="" 
            width={35} 
            height={10} 
            className="block sm:hidden size-10 absolute bottom-5 right-[18.5%] animate-bat-float-delay-2" 
          />
          <Image 
            src="/Hero/Vector-2.png" 
            alt="" 
            width={30} 
            height={10} 
            className="block sm:hidden size-10 absolute bottom-10 right-[20%] animate-bat-float" 
          />
          <Image 
            src="/Hero/Vector-1.png" 
            alt="" 
            width={20} 
            height={10} 
            className="block sm:hidden size-10 absolute bottom-10 right-[19%] animate-bat-float-delay-1" 
          />
          <Image 
            src="/Hero/ghost.png" 
            alt="" 
            width={85} 
            height={10} 
            className="block sm:hidden size-10 absolute bottom-10 right-[15%] animate-ghost-float" 
          />
          {}
          <Image 
            src="/Hero/Vector-5.png" 
            alt="" 
            width={30} 
            height={10} 
            className="block sm:hidden size-10 absolute bottom-10 right-[24%] animate-bat-float" 
          />
          {}
          <Image 
            src="/Hero/Vector-6.png" 
            alt="" 
            width={35} 
            height={10} 
            className="block sm:hidden size-10 absolute bottom-10 right-[28%] animate-bat-float-delay-2" 
          />
      </div>
       <div className="absolute top-[32%] left-1/2 -translate-x-1/2 sm:relative sm:top-[8%] md:top-[8%] lg:top-[8%] sm:left-[-15] sm:translate-x-0 flex flex-col items-center w-full px-4 sm:flex-row-reverse sm:justify-between sm:items-center sm:my-0">
        <div className="flex flex-col items-center text-center sm:items-end sm:text-right pr-0 sm:pr-[8%] pt-0 sm:pt-[15%]">
          <h1
            className={`${nosifer.className} hero-title text-[10vw] sm:text-[6vw] leading-none hover-lift opacity-0`}
          >
            <span className="text-[#FF0700]">Hackman</span>{' '}
            <span className="text-white">V8</span>
          </h1>
          <div className="flex justify-start">
            <a
              href="/registration"
              className={`${jolly.className} hero-button 
                w-[35vw] h-[10vw] 
                sm:w-[19vw] sm:h-[4.5vw] 
                mt-6 bg-[#FE772D] text-gray-800 
                rounded-[1rem] 
                text-[5vw] sm:text-[2.8vw] 
                flex items-center justify-center transform transition-all duration-300 hover:scale-105 hover:bg-[#E5691F] hover:shadow-xl hover-lift opacity-0`}
            >
              Register Now
            </a>
          </div>
          <div className={`${jolly.className} hero-subtitle flex justify-start mt-4 mb-6 opacity-0`}>
            <div className="relative inline-block animate-date-glow w-[35vw] sm:w-[19vw]">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#FF0700] via-[#FE772D] to-[#FF0700] rounded-xl blur-md opacity-90"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FE772D] via-[#FF0700] to-[#FE772D] rounded-lg blur-sm opacity-60"></div>
              <div className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 px-8 py-4 rounded-xl border-2 border-[#FE772D] backdrop-blur-sm flex items-center justify-center">
                <span className="animate-text-shimmer text-[3.5vw] sm:text-[1.8vw] font-bold tracking-wider drop-shadow-2xl text-center">
                  31st October 2025
                </span>
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-[#FF0700] to-[#FE772D] rounded-full animate-corner-pulse"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#FF0700] to-[#FE772D] rounded-full animate-corner-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-[#FF0700] to-[#FE772D] rounded-full animate-corner-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-[#FF0700] to-[#FE772D] rounded-full animate-corner-pulse" style={{animationDelay: '1.5s'}}></div>
                
                {/* Additional decorative elements */}
                <div className="absolute top-1/2 -left-6 w-2 h-8 bg-gradient-to-b from-[#FE772D] to-transparent rounded-full opacity-60"></div>
                <div className="absolute top-1/2 -right-6 w-2 h-8 bg-gradient-to-b from-[#FE772D] to-transparent rounded-full opacity-60"></div>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-b from-[#FF0700] to-transparent rounded-full opacity-70"></div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-b from-[#FF0700] to-transparent rounded-full opacity-70"></div>
              </div>
            </div>
          </div>
          {}
        </div>
      </div>
      <div className="hidden sm:block">
        <p
          className={`${poppins.className} hero-text absolute 
          bottom-[10%] left-[16%]
          sm:bottom-[10%] sm:left-[16%]
          md:bottom-[10%] md:left-[16%]
          lg:bottom-[10%] lg:left-[16%]
          text-xs sm:text-sm md:text-sm lg:text-xl text-white hover-lift opacity-0`}
        >
          Where creativity meets technology. A community of thinkers, builders,
          and leaders shaping the future.
        </p>
      </div>
      {}
      </section>
      <div className="block sm:hidden absolute bottom-0 left-0 right-0 p-4 z-25 bg-black bg-opacity-50">
        <p className={`${poppins.className} text-white text-center text-[10px]`}>
          Where creativity meets technology. A community of thinkers, builders, and leaders shaping the future.
        </p>
      </div>
    </>
  );
}