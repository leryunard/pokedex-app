import {Dropdown} from "primereact/dropdown";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectInputProps {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SelectInput({
                                        label,
                                        value,
                                        options,
                                        onChange,
                                        placeholder = "Select an option",
                                        className = "",
                                    }: SelectInputProps) {
    return (
        <div>
            <label className="block mb-1 font-medium text-white">{label}</label>
            <Dropdown
                value={value}
                options={options}
                onChange={(e) => onChange(e.value)}
                placeholder={placeholder}
                className={`w-full border rounded p-2 bg-white text-black shadow-sm focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
            />
        </div>
    );
}
