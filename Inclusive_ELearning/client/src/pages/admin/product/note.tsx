import { useGetCategorysQuery } from "@/api/category";
import { useAddProductMutation } from "@/api/courses";
import { Icategory } from "@/interfaces/category";
import { Button, Form, Input, Select, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { AiOutlineLoading } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";

const { Option } = Select;

const AdminProductAdd = () => {
    const chatLieuOptions = ["Option 1", "Option 2", "Option 3"];
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
    const { data: categorysData } = useGetCategorysQuery();
    const [messageApi, contextHolder] = message.useMessage();
    const [addProduct, { isLoading: isAddProductLoading }] = useAddProductMutation();

    const onDrop = async (acceptedFiles: any) => {
        try {
            // Sử dụng Promise.all để gửi các yêu cầu tải lên song song
            const uploadPromises = acceptedFiles.map(async (file: any) => {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", "your_cloudinary_upload_preset");

                const response = await axios.post(
                    "https://api.cloudinary.com/v1_1/dem0uwchx/image/upload?upload_preset=t7ahvua5",
                    formData
                );

                return response.data.secure_url;
            });

            // Chờ cho tất cả các yêu cầu tải lên hoàn thành
            const imageUrls = await Promise.all(uploadPromises);

            // Lưu trữ các URL vào state
            setUploadedFileUrls(prevUrls => [...prevUrls, ...imageUrls]);

            // Log state sau khi lưu dữ liệu từ Cloudinary vào
            console.log("Uploaded file URLs:", uploadedFileUrls);
        } catch (error) {
            console.error("Error uploading images to Cloudinary:", error);
        }
    };
    useEffect(() => {
        console.log("Uploaded file URLs:", uploadedFileUrls);
    }, [uploadedFileUrls]);
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const cateSource = categorysData?.map((item: Icategory) => ({
        key: item.id,
        categoryName: item.categoryName,
        categoryDescription: item.categoryDescription
    }));

    const onFinish = (values: any) => {
        // Đặt URL của tất cả ảnh vào trong values để gửi lên API
        values.courseIMG = uploadedFileUrls;
        // Gọi hàm addProduct từ mutation hook
        addProduct(values)
            .unwrap()
            .then(() => {
                messageApi.open({
                    type: "success",
                    content: "Bạn đã thêm khóa học mới thành công. Chờ 3s để quay về quản trị",
                });
                form.resetFields();
                setUploadedFileUrls([]); // Xóa mảng các URL sau khi gửi form thành công
                setTimeout(() => {
                    navigate("/admin/product");
                }, 3000);
            });
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <>
            {contextHolder}
            <header className="mb-4">
                <h2 className="text-2xl">Thêm Sản Phẩm mới!</h2>
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
                <Form.Item
                    label="Tên sản phẩm"
                    name="courseName"
                    rules={[
                        { required: true, message: "Tên sản phẩm không được để trống!" },
                        { min: 5, message: "Tên sản phẩm ít nhất phải 3 ký tự" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Giá tiền (VND)"
                    name="price"
                    rules={[
                        { required: true, message: "Phải nhập giá tiền" },
                    ]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    label="Hình ảnh"
                    name="courseIMG"
                  
                >
                    <div {...getRootProps()} style={{ border: '1px dashed #d9d9d9', padding: '20px', textAlign: 'center' }}>
                        <input {...getInputProps()} />
                        <p>Thả hình ảnh vào đây hoặc click để chọn hình</p>
                    </div>
                    {/* Hiển thị các ảnh đã tải lên */}
                    {uploadedFileUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Hình ảnh ${index + 1}`}
                            style={{ marginTop: '10px', width: 100, height: 100 }}
                        />
                    ))}
                </Form.Item>

                {/* Các trường form khác ở đây */}

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

export default AdminProductAdd;
