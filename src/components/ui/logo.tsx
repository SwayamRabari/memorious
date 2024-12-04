export default function Logo() {
  return (
    <>
      <div className="logo text-2xl font-bold flex items-center gap-3 select-none">
        <div
          className="h-10 bg-secondary w-10 rounded-md flex justify-center items-center
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
        <div className="text-2xl font-bold text-foreground hidden sm:block">
          Memorious
        </div>
      </div>
    </>
  );
}
