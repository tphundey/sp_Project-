import { useGetCategorysQuery } from "@/api/category";
import {
    useAddProductMutation,
    useGetProductByIdQuery,
    useUpdateProductMutation,
} from "@/api/courses";
import { Icategory } from "@/interfaces/category";
import { Button, DatePicker, Form, Input, Select, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import { useEffect } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";

const { Option } = Select;

const AdminProductEdit = () => {
    const materialOptions = ["Carbon", "Cartoon"];
    const colorOptions = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Gray"];
    const { idProduct } = useParams<{ idProduct: string }>();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const { data: productData, isLoading: isProductLoading } = useGetProductByIdQuery(
        idProduct || ""
    );
    const [updateProduct, { isLoading: isUpdateLoading }] = useUpdateProductMutation();

    useEffect(() => {
        form.setFieldsValue(productData);
    }, [productData]);

    const onFinish = (values: any) => {
        updateProduct({ ...values, id: idProduct })
            .unwrap()
            .then(() => {
                messageApi.open({
                    type: "success",
                    content: "Bạn đã cập nhật sản phẩm thành công. Chờ 3s để quay về quản trị",
                });
                setTimeout(() => {
                    navigate("/admin/product");
                }, 3000);
            });
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log("Failed:", errorInfo);
    };

    const { data: cateData } = useGetCategorysQuery();
    const dataSource = cateData?.map((item: Icategory) => ({
        key: item.id,
        categoryName: item.categoryName,
        categoryDescription: item.categoryDescription
    }));

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
            form.setFieldsValue({ courseIMG: imageUrl });
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <>
            {contextHolder}
            <header className="mb-4">
                <h2 className="text-2xl">Cập nhật sản phẩm</h2>
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
                        { min: 3, message: "Tên sản phẩm ít nhất phải 3 ký tự" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Giá tiền (VND)"
                    name="price"
                    rules={[{ required: true, message: "Phải nhập giá tiền" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mô tả sản phẩm"
                    name="description"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                >
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    label="Chất liệu"
                    name="material"
                    rules={[{ required: true, message: 'Vui lòng chọn chất liệu!' }]}
                >
                    <Select placeholder="Chọn chất liệu" allowClear>
                        {materialOptions.map((material, index) => (
                            <Select.Option key={index} value={material}>
                                {material}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Màu sắc"
                    name="color"
                    rules={[{ required: true, message: 'Vui lòng chọn màu sắc!' }]}
                >
                    <Select mode="multiple" placeholder="Chọn màu sắc">
                        {colorOptions.map((color, index) => (
                            <Select.Option key={index} value={color}>
                                {color}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Hình ảnh"
                    name="courseIMG"
                >
                    <div {...getRootProps()} style={{ border: '1px dashed #d9d9d9', padding: '20px', textAlign: 'center' }}>
                        <input {...getInputProps()} />
                        <p>Thả hình ảnh vào đây hoặc click để chọn hình</p>
                    </div>
                    <div className="flex gap-2">
                        {form.getFieldValue("courseIMG")?.map((imageUrl: string, index: number) => (

                            <div>
                                <img
                                    key={index}
                                    src={imageUrl}
                                    alt={`Hình ảnh ${index + 1}`}
                                    style={{ marginTop: '10px', width: 100, height: 100 }}
                                />
                            </div>

                        ))} </div>
                </Form.Item>

                <Form.Item
                    label="Danh mục"
                    name="categoryID"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                    <Select placeholder="Vui lòng chọn danh mục" allowClear>
                        {dataSource?.map((item: any) => (
                            <Option key={item.key} value={item.key}>
                                {item.categoryName}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" danger htmlType="submit">
                        {isUpdateLoading ? <AiOutlineLoading className="animate-spin" /> : "Cập nhật"}
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default AdminProductEdit;
