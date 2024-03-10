import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Space, Modal, DatePicker, InputNumber, message } from 'antd';
import axios from 'axios';

const CouponManagement = () => {
  const [form] = Form.useForm();
  const [coupons, setCoupons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null); // State to store the coupon being edited

  const columns = [
    // Column definitions remain the same
    //...
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {isCouponExpiredOrZeroQuantity(record) && (
            <Button className='bg-red-400 text-white' onClick={() => handleEdit(record)}>Sửa</Button> // Change Delete to Edit
          )}
        </Space>
      ),
    },
  ];

  const isCouponExpiredOrZeroQuantity = (coupon) => {
    const currentDate = new Date();
    const expirationDate = new Date(coupon.expirationDate);

    return expirationDate < currentDate || coupon.quantity === 0;
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon); // Set the coupon to be edited
    form.setFieldsValue({
      code: coupon.code,
      amount: coupon.amount,
      startDate: moment(coupon.startDate),
      expirationDate: moment(coupon.expirationDate),
      quantity: coupon.quantity,
    });
    setModalVisible(true); // Open the modal
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const id = editingCoupon ? editingCoupon.id : coupons.length + 1; // Determine if it's editing or adding new
      const amount = values.amount || 0;
      const expirationDate = values.expirationDate.format('YYYY-MM-DD');
      const startDate = values.startDate.format('YYYY-MM-DD');
      const createdAt = new Date().toISOString();

      const isDuplicateCode = coupons.some((coupon) => coupon.code === values.code && coupon.id !== id);

      if (isDuplicateCode) {
        message.error('Mã Coupon đã tồn tại. Vui lòng chọn mã khác.');
        return;
      }

      if (new Date(startDate) > new Date(expirationDate)) {
        message.error('Ngày bắt đầu không được lớn hơn ngày hết hạn.');
        return;
      }

      const updatedCoupons = coupons.map(coupon =>
        coupon.id === id ? { ...values, id, amount, expirationDate, startDate, createdAt } : coupon
      );

      if (editingCoupon) {
        setEditingCoupon(null); // Clear editing coupon state
        message.success('Cập nhật thành công!');
      } else {
        message.success('Thêm thành công!');
      }

      setCoupons(updatedCoupons);
      setModalVisible(false);
      form.resetFields();

      if (editingCoupon) {
        await axios.put(`http://localhost:3000/Coupons/${id}`, { ...values, id, amount, expirationDate, startDate, createdAt });
      } else {
        await axios.post('http://localhost:3000/Coupons', { ...values, id, amount, expirationDate, startDate, createdAt });
      }
    } catch (error) {
      console.error('Validation failed', error);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingCoupon(null); // Clear editing coupon state
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/Coupons');
        const sortedCoupons = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCoupons(sortedCoupons);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Button className='mb-4' type="default" onClick={() => { setEditingCoupon(null); setModalVisible(true); }}>
        Thêm Coupon
      </Button>

      <Table columns={columns} dataSource={coupons} />

      <Modal
        title={editingCoupon ? "Cập nhật Coupon" : "Thêm Coupon"}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã Coupon" rules={[{ required: true, message: 'Nhập mã coupon!' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="expirationDate"
            label="Ngày hết hạn"
            rules={[{ required: true, message: 'Chọn ngày hết hạn!' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Chọn ngày bắt đầu!' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Nhập số lượng!' }]}>
            <InputNumber min={0} max={10} />
          </Form.Item>
          <Form.Item name="amount" label="Số tiền">
            <InputNumber min={1} max={70} formatter={value => `${value}%`} parser={value => value.replace('%', '')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponManagement;
