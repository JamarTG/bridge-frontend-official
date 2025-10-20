const Logo = () => {
  return (
    <div className="flex justify-center items-center gap-1 cursor-pointer">
          <svg
            viewBox="0 0 24 24"
            width={45}
            xmlns="http://www.w3.org/2000/svg"
            fill="#000000"
          >
            <defs>
              <style>{`.cls-1{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}`}</style>
            </defs>
            <g id="ic-places-bridge">
              <line className="cls-1" x1="2" y1="15" x2="22" y2="15" />
              <path className="cls-1" d="M4,18V6H4A9.39,9.39,0,0,0,20,6h0V18" />
              <line className="cls-1" x1="8" y1="9.59" x2="8" y2="15" />
              <line className="cls-1" x1="16" y1="9.59" x2="16" y2="15" />
              <line className="cls-1" x1="12" y1="10.47" x2="12" y2="15" />
            </g>
          </svg>
          <h2 className="font-bold text-2xl">Bridge</h2>
        </div>
  )
}

export default Logo
