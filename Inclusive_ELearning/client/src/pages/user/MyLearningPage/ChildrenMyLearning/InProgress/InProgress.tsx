import { useState, useEffect } from 'react';
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
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
        <div className='orders'>
            {orders.length > 0 ? (
                <ul >

                    {orders.map(order => (

                        <li className='ord-map'  style={{ width: 700 }} key={order.id}>
                              <h3 className='text-xs ml-12 mb-3'>Mã đơn hàng: {order.id}</h3>
                            <ul>
                                {order?.items.map((item: any, index: any) => (
                                    <li key={index}>
                                        <div className='flex pro-cr'>
                                            <img width={120} src={courses[item.productId].courseIMG[0]} alt="" />
                                            <div>
                                                <p className='font-medium'>{courses[item.productId].courseName}</p>
                                                Kích cỡ: {item.size}, Màu sắc: {item.color}, Số lượng: {item.quantity} đôi
                                            </div>
                                        </div>

                                    </li>
                                ))}
                            </ul>
                            <div className='ml-12'>
                                <p>Thành tiền: <span className='text-red-500 font-medium'>đ{order?.amount}</span></p>
                              
                                <div className="flex justify-between">
                                    <div>
                                        <p className='text-green-600 font-medium'> <i class="fa-solid fa-truck-fast"></i> {order?.status}</p>
                                        <p className='text-sm'>Trạng thái thanh toán: {order?.status2}</p>
                                        <p className='text-sm'>Trạng thái thanh toán: {order?.option}</p>
                                    </div>

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