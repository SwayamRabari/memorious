export default function LogoMark() {
  return (
    <>
      <div
        className="h-10 bg-transparent w-10 rounded-md hidden md:flex justify-center items-center scale-[7] opacity-55
            "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="171"
          viewBox="0 0 100 171"
          fill="none"
          style={{
            height: '50%',
          }}
        >
          <path
            d="M100 0H0V171L50 143L100 171V0Z"
            className="fill-secondary-foreground"
          />
        </svg>
      </div>
    </>
  );
}
