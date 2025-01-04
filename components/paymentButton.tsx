



interface PaymentButtonProps {
  onClick:() =>void;
  
  buttonText?: string;
  
  loading:boolean
}

export default function PaymentButton({
  onClick,
   loading,
   buttonText,
}: PaymentButtonProps) {
 

  return (
    <div className="payment-container ">
      <button
        onClick={() =>{
        onClick()
        }}
        className={`btn-primary bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Processing..." : buttonText ? buttonText : "Pay Now"}
      </button>
      {/* <div className="iframe-container flex-grow w-full max-w-3xl border border-gray-300 mt-4 rounded-lg overflow-hidden">
//                 <iframe
//                     name="next-app-iframe"
//                     className="iframe w-full h-full"
//                     title="Cashfree Payment"
//                 ></iframe>
//             </div> */}
    </div>
  );
}
