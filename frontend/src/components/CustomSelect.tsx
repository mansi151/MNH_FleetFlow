import React from 'react';
import { Form } from 'react-bootstrap';
import { FiChevronDown } from 'react-icons/fi';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    touched?: boolean;
    icon?: React.ReactNode;
    placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    label,
    options,
    value,
    onChange,
    error,
    touched,
    icon,
    placeholder = 'Select an option'
}) => {
    return (
        <Form.Group className="mb-3 position-relative">
            {label && <Form.Label className="small fw-bold text-secondary mb-2">{label}</Form.Label>}
            <div className="position-relative">
                {icon && (
                    <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-secondary" style={{ zIndex: 10 }}>
                        {icon}
                    </div>
                )}
                <Form.Select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`rounded-3 border-light bg-light py-2 ${icon ? 'ps-5' : 'ps-3'} ${touched && error ? 'border-danger' : ''}`}
                    style={{
                        appearance: 'none',
                        boxShadow: 'none',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Form.Select>
                <div className="position-absolute top-50 end-0 translate-middle-y pe-3 pointer-events-none text-secondary">
                    <FiChevronDown size={18} />
                </div>
            </div>
            {touched && error && (
                <div className="text-danger small mt-1 animate__animated animate__fadeIn">
                    {error}
                </div>
            )}
        </Form.Group>
    );
};

export default CustomSelect;
