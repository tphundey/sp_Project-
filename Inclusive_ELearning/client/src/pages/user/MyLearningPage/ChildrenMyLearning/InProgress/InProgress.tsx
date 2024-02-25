import React, { useState, useEffect } from 'react';
import { firebaseConfig } from '@/components/GetAuth/firebaseConfig';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const InProgress = () => {
    const [orders, setOrders] = useState([]);
    const [courses, setCourses] = useState({});
    const [email, setEmail] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserID] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setEmail(currentUser?.email);
            setLoading(false);
        });
        return () => {
            unsubscribe();
        };
    }, []);

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
    console.log(userId);

    useEffect(() => {
        // Fetch orders
        fetch(`http://localhost:3000/Payment`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to fetch orders');
            })
            .then(data => {
                console.log(data);
                // Filter orders for the specific user
                const userOrders = data.filter(order => order.userId === userId);

                // Parse the items string in each order
                userOrders.forEach(order => {
                    order.items = JSON.parse(order.items);
                });
                setOrders(userOrders);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                setLoading(false);
            });

        // Fetch courses
        fetch("http://localhost:3000/Courses")
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to fetch courses');
            })
            .then(data => {
                // Create a map of course IDs to course data
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
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="orders">

            {orders.length > 0 ? (
                <ul>
                    {orders.map(order => (
                        <li style={{ width: 700}} key={order.id}>
                            <h3 className='text-xs'>Mã đơn hàng: {order.id}</h3>
                            <div className="flex justify-between">
                                <div>
                                    <p>Gía tiền: {order.amount}đ</p>
                                    <p>Tình trạng đơn hàng {order.amount}đ</p>
                                    <p>Hình thức thanh toán: {order.amount}đ</p>
                         
                                </div>
                                <div >
                                    <ul>
                                        {order.items.map((item, index) => (
                                            <li key={index}>
                                                Size: {item.size}, Color: {item.color}, Quantity: {item.quantity}
                                                {/* Display course information based on product ID */}
                                                {courses[item.productId] && (
                                                    <div className='flex'>
                                                        <p>{courses[item.productId].courseName}</p>
                                                        <img width={120} src={courses[item.productId].courseIMG[0]} alt="" />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default InProgress;