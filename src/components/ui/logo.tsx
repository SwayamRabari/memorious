export default function Logo() {
  return (
    <div className="logo flex items-center gap-3 select-none">
      <div
        className="h-10 w-10 bg-secondary rounded-md flex justify-center items-center"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 100 171"
          fill="none"
          role="img"
          aria-label="Memorious logo"
        >
          <path
            d="M100 0H0V171L50 143L100 171V0Z"
            className="fill-secondary-foreground"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold text-foreground hidden sm:block">
        Memorious
      </span>
    </div>
  );
}
