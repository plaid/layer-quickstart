interface BirthdayInputStepProps {
  phoneNumber: string;
  dateOfBirth: string;
  onDateOfBirthChange: (value: string) => void;
  onSubmit: () => void;
}

const BirthdayInputStep: React.FC<BirthdayInputStepProps> = ({
  phoneNumber,
  dateOfBirth,
  onDateOfBirthChange,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          className="w-full p-2 border border-gray-300 rounded bg-gray-100"
          disabled
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="dateOfBirth"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          value={dateOfBirth}
          onChange={(e) => onDateOfBirthChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 text-lg"
      >
        Continue
      </button>
    </form>
  );
};

export default BirthdayInputStep;
