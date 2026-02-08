import { Form } from "antd";
import Input from "../atoms/Input";

type FormInputProps = {
    name: string;
    label: string;
    rules?: any[];
    placeholder?: string;
    type?: string;
}

export default function FormInputProps({
    name,
    label,
    rules,
    placeholder,
    type = "text",
}: FormInputProps) {
    return (
        <Form.Item
            label={label}
            name={name}
            rules={rules}>

            <Input type={type} placeholder={placeholder} />

        </Form.Item>
    );
}