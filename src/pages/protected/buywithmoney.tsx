import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { QRCodeCanvas } from 'qrcode.react';

const BuyWithMoney: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [qrValue, setQrValue] = useState<string>('');

  const generateQRCode = () => {
    if (paymentAmount > 0) {
      setQrValue(`Payment of ${paymentAmount} requested.`);
    } else {
      alert('Please enter a valid payment amount!');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-2/4 p-4 border-r text-center border-gray-300 bg-white dark:bg-black">
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
            onClick={() => router.push('/protected/dashboard')}
          >
            Back to Dashboard
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mb-2 w-2/3"
            onClick={() => router.push('/protected/deposit')}
          >
            Deposit Crypto
          </button>
        </div>
      </div>
      <div className="flex w-full justify-center min-h-screen h-screen bg-white dark:bg-black text-white p-6">
        <div className="w-full sm:w-full sm:border sm:rounded-3xl md:w-5/6 lg:w-2/4 bg-blue-300 text-black dark:bg-black dark:text-white py-8 px-4 mb-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Enter Payment Amount</h3>
            <input
              type="number"
              className="mt-1 p-2 block w-full border dark:text-black text-black border-gray-300 rounded-full"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              required
            />
          </div>
          <button
            className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded mb-4 w-full"
            onClick={generateQRCode}
          >
            Generate QR Code
          </button>
          {qrValue && (
            <div className="mt-4 text-center">
              <h4 className="mb-2 text-lg">Scan the QR Code to Pay</h4>
              <QRCodeCanvas value={qrValue} size={200} />
              <p className="mt-2 text-sm">{qrValue}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyWithMoney;
