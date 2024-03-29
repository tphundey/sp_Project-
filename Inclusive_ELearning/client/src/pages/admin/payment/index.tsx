import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { Empty } from 'antd';
import { firebaseConfig } from '@/components/GetAuth/firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AdminPayment = (props: any) => {
    const [orders, setOrders] = useState([]);
    const [courses, setCourses] = useState({});
    const [email, setEmail] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserID] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
            setUser(currentUser);
            setEmail(currentUser?.email);
            setLoading(false);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const updateOrderStatus = (orderId: string, newStatus: string) => {
        // Implement logic to update order status in backend or local state
        console.log("Updating order status:", orderId, newStatus);

        // Gửi yêu cầu PATCH đến API để cập nhật trạng thái của đơn hàng
        fetch(`http://localhost:3000/Payment/${orderId}`, {
            method: 'PATCH', // hoặc 'PUT' nếu API của bạn yêu cầu
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: newStatus,
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update order status');
                }
                window.location.reload();
            })
            .catch(error => {
                console.error('Error updating order status:', error);
                // Xử lý lỗi hoặc hiển thị thông báo cho người dùng nếu cần
            });
    };

    useEffect(() => {
        if (email) {
            fetch(`http://localhost:3000/googleAccount?email=${email}`)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch user data from API.');
                    }
                })
                .then((userDataArray) => {
                    if (userDataArray.length > 0) {
                        const userData = userDataArray[0];
                        setUserID(userData.id);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [email]);

    useEffect(() => {
        fetch(`http://localhost:3000/Payment`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to fetch orders');
            })
            .then(data => {
                // Đảo ngược thứ tự các đơn hàng
                data.reverse();
                // Kiểm tra và xử lý cấu trúc không đồng nhất của items
                data.forEach(order => {
                    if (typeof order.items === 'string') {
                        order.items = JSON.parse(order.items);
                    }
                });
                setOrders(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch("http://localhost:3000/Courses")
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to fetch courses');
            })
            .then(data => {
                // Reverse the order of the courses array
                data.reverse();
                const coursesMap = {};
                data.forEach(course => {
                    coursesMap[course.id] = course;
                });
                setCourses(coursesMap);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:3000/googleAccount`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Failed to fetch user data');
                })
                .then(userDataArray => {
                    // Tìm người dùng với userId tương ứng
                    const userData = userDataArray.find(user => user.id === userId);
                    if (userData) {
                        // Cập nhật thông tin địa chỉ và số điện thoại trong mỗi đơn hàng
                        const updatedOrders = orders.map(order => {
                            if (order.userId === userId) {
                                order.address = userData.address;
                                order.phone = userData.phone;
                            }
                            return order;
                        });
                        setOrders(updatedOrders);
                    } else {
                        console.error('User not found');
                    }
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, [userId, orders]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='orders'>
            {orders.length > 0 ? (
                <ul>
                    {orders.map(order => (
                        <li className='ord-map' style={{ width: 700 }} key={order.id}>
                            <h3 className='text-xs ml-12 mb-3'>Mã đơn hàng: {order.id}</h3>
                            <ul>
                                {order.items.map((item: any, index: any) => (
                                    <li key={index}>
                                        <div className='flex pro-cr'>
                                            {courses[item.productId] && courses[item.productId].courseIMG ? (
                                                <img width={120} src={courses[item.productId].courseIMG[0]} alt="" />
                                            ) : (
                                                <div>No image available</div>
                                            )}
                                            <div>
                                                <p className='font-medium'>{courses[item.productId]?.courseName || 'Unknown Course'}</p>
                                                Kích cỡ: {item.size}, Màu sắc: {item.color}, Số lượng: {item.quantity} đôi
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className='ml-12'>
                                <p>Thành tiền: <span className='text-red-500 font-medium'>đ{order.amount}</span></p>
                                <div className="flex justify-between">
                                    <div>
                                        <p className='text-green-600 font-medium'> <i className="fa-solid fa-truck-fast"></i> {order.status}</p>
                                        <select onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                                            <option value="Đơn hàng chờ xác nhận">Đơn hàng chờ xác nhận</option>
                                            <option value="Đơn hàng đang được đóng gói">Đơn hàng đang được đóng gói</option>
                                            <option value="Đơn hàng đang được giao cho đơn vị vận chuyển">Đơn hàng đang được giao cho đơn vị vận chuyển</option>
                                            <option value="Đơn hàng đang được giao">Đơn hàng đang được giao</option>
                                            <option value="Đơn hàng đã được giao thành công">Đơn hàng đã được giao thành công</option>
                                            <option value="Đơn hàng đang hoàn trả">Đơn hàng đang hoàn trả</option>
                                            <option value="Đơn hàng đã hủy">Đơn hàng đã hủy</option>
                                        </select>
                                        <p className='text-sm'>Trạng thái thanh toán: {order.status2}</p>
                                        <p className='text-sm'>Id người dùng: {order.userId}</p>
                                        {order.address && <p className='text-sm'>Địa chỉ: {order.address}</p>}
                                        {order.phone && <p className='text-sm'>Số điện thoại: {order.phone}</p>}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <Empty className='mt-20' />
            )}
        </div>
    );
};

export default AdminPayment;
