import {InputText} from "primereact/inputtext";

interface TextInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}

export default function TextInput({
                                      label,
                                      value,
                                      onChange,
                                      placeholder,
                                      className = "",
                                  }: TextInputProps) {
    return (
        <div>
            <label className="block mb-1 font-medium text-white">{label}</label>
            <InputText
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full border rounded p-2 bg-white text-black shadow-sm focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
            />
        </div>
    );
}
