import { useAddCategoryMutation } from "@/api/category";
import { Button, Form, Input, message } from "antd";
import { AiOutlineLoading } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useDropzone } from "react-dropzone";
type FieldType = {
    categoryName: string,
    categoryDescription: string,
};
const AdminCategoryAdd = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [addProduct, { isLoading: isAddProductLoading }] = useAddCategoryMutation();
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null); // State to store image URL

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:3000/categories');
                const categories = response.data;
                const categoryNames = categories.map((category: any) => category.categoryName);
                setExistingCategories(categoryNames);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const onFinish = (values: FieldType) => {
        const { categoryName } = values;
        if (existingCategories.includes(categoryName)) {
            messageApi.error({
                content: 'Tên danh mục đã tồn tại. Vui lòng chọn một tên khác.',
            });
            return;
        }

        // Call addProduct mutation with values and image URL
        addProduct({ ...values, anhdanhmuc: imageUrl })
            .unwrap()
            .then(() => {
                messageApi.open({
                    type: 'success',
                    content: 'Bạn đã thêm danh mục thành công. Chờ 2s để quay về quản trị',
                });
                form.resetFields();
                setTimeout(() => {
                    navigate('/admin/categories');
                }, 2000);
            });
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onDrop = async (acceptedFiles: any) => {
        try {
            const formData = new FormData();
            formData.append("file", acceptedFiles[0]);
            formData.append("upload_preset", "your_cloudinary_upload_preset");

            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dem0uwchx/image/upload?upload_preset=t7ahvua5",
                formData
            );

            const imageUrl = response.data.secure_url;
            setImageUrl(imageUrl); // Set the image URL
            form.setFieldsValue({ anhdanhmuc: imageUrl }); // Set form field value
            console.log("Image URL:", imageUrl); // Log the image URL
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <>
            {contextHolder}
            <header className="mb-4">
                <h2 className="text-2xl">Thêm thương hiệu</h2>
            </header>
            <Form
                form={form}
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    label="Tên thương hiệu"
                    name="categoryName"
                    rules={[
                        { required: true, message: "Tên thương hiệu không được để trống!" },
                        { min: 1, message: "Tên thương hiệu ít nhất phải 5 ký tự" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Hình ảnh"
                    name="anhdanhmuc"
                    rules={[{ type: 'url', message: 'Hình ảnh không hợp lệ', required: true }]}
                >
                    <div {...getRootProps()} style={{ border: '1px dashed #d9d9d9', padding: '20px', textAlign: 'center' }}>
                        <input {...getInputProps()} />
                        <p>Thả hình ảnh vào đây hoặc click để chọn hình</p>
                    </div>
                    {form.getFieldValue("anhdanhmuc") && (
                        <img
                            src={form.getFieldValue("anhdanhmuc")}
                            alt="Hình ảnh đã upload"
                            style={{ marginTop: '10px', width: 100, height: 100 }}
                        />
                    )}
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" danger htmlType="submit">
                        {isAddProductLoading ? (
                            <AiOutlineLoading className="animate-spin" />
                        ) : (
                            "Thêm"
                        )}
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default AdminCategoryAdd;
