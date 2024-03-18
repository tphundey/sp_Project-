import React, { useEffect, useState } from 'react';
import { Button, Input, Radio, message } from 'antd';
import { firebaseConfig } from '@/components/GetAuth/firebaseConfig';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import './cartpage.css';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const CartPage = () => {
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
    const [discountCode, setDiscountCode] = useState<string>('');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [email, setEmail] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserID] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userNotes, setUserNotes] = useState<any[]>([]);
    const [courseData, setCourseData] = useState<any[]>([]);
    const [productQuantities, setProductQuantities] = useState<{ [productId: string]: number }>({});
    const [total2, setTotal2] = useState<number>(0);

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
                        fetchUserNotes(userData.id);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [email]);

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:3000/Courses`)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch course data from API.');
                    }
                })
                .then((data) => {
                    setCourseData(data);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [userId]);

    const handleCashPayment = async () => {
        try {
            const totalToPay = discountCode ? total2 : calculateTotal();

            const paymentResponse = await fetch("http://localhost:3000/Payment", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentStatus: true,
                    userId: userId,
                    amount: totalToPay,
                    status: "Đơn hàng chờ xác nhận",
                    status2: "Chưa thanh toán",
                    option: "Tiền mặt",
                    items: aggregatedCartItems.map(item => ({
                        productId: item.productId,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity
                    }))
                })
            });

            if (paymentResponse.ok) {
                const deleteCartResponse = await fetch(`http://localhost:3000/notes?userID=${userId}`, {
                    method: 'DELETE'
                });
                alert("Thanh toán bằng tiền mặt thành công!");
                window.location.href = "http://localhost:5173/";
                if (deleteCartResponse.ok) {

                } else {

                }
            } else {

            }
        } catch (error) {
            console.error(error);

        }
    };

    const fetchUserNotes = (userId: string) => {
        fetch(`http://localhost:3000/notes`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch user notes from API.');
                }
            })
            .then((notesData) => {
                const userNotes = notesData.filter(note => note.userID === userId);
                setUserNotes(userNotes);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleCheckout = () => {
        if (!userId) {
            console.error("User ID not found.");
            return;
        }

        if (paymentMethod === 'tienmat') {
            handleCashPayment();
        } else if (paymentMethod === 'banking') {
            const totalToPay = discountCode ? total2 : calculateTotal();

            fetch("http://localhost:3000/saveOrder", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: totalToPay,
                    userId: userId,
                    items: aggregatedCartItems.map(item => ({
                        productId: item.productId,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity
                    }))
                })
            })
                .then((response) => {
                    if (response.ok) {
                        console.log("Total amount saved successfully.");
                        window.location.href = "http://localhost:3000/order";
                    } else {
                        throw new Error('Failed to save amount.');
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            console.error("Unsupported payment method:", paymentMethod);
        }
    };

    const aggregateCartItems = () => {
        const aggregatedItems: any = {};
        userNotes.forEach((note) => {
            const key = `${note.productId}-${note.userID}`;
            if (aggregatedItems[key]) {
                aggregatedItems[key].quantity += note.quantity;
            } else {
                aggregatedItems[key] = { ...note };
            }
        });
        return Object.values(aggregatedItems);
    };

    const aggregatedCartItems = aggregateCartItems();

    const calculateTotal = () => {
        let total = 0;
        aggregatedCartItems.forEach((item) => {
            const course = courseData.find((course) => course.id === item.productId);
            if (course) {
                const price = parseFloat(course.price);
                const quantity = productQuantities[item.productId] || item.quantity;
                total += quantity * price;
            }
        });
        return total;
    };

    const applyDiscount = () => {
        if (!discountCode) {
            message.error("Please enter a discount code.");
            return;
        }

        fetch("http://localhost:3000/Coupons")
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to fetch coupon codes.');
                }
            })
            .then((couponData) => {
                if (Array.isArray(couponData)) {
                    const coupon = couponData.find(coupon => coupon.code === discountCode);
                    if (coupon) {
                        const discountPercentage = coupon.amount;
                        const discount = calculateTotal() * (discountPercentage / 100);
                        const discountedTotal = calculateTotal() - discount;
                        setDiscountAmount(discount);
                        const discountValue = calculateTotal() * (discountPercentage / 100);
                        setDiscountValue(discountValue);
                        setTotal2(discountedTotal);
                        message.success("Discount applied successfully.");
                        console.log("Total after discount:", discountedTotal);
                    } else {
                        message.error("Invalid discount code.");
                    }
                } else {
                    throw new Error('Coupon data is not in the expected format.');
                }
            })
            .catch((error) => {
                console.error(error);
                message.error("Failed to validate discount code.");
            });
    };

    const updateProductQuantity = (productId: string, quantity: number) => {
        setProductQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: quantity
        }));
        recalculateTotal(); // Gọi hàm để tính lại số tiền tổng cộng
    };

    const recalculateTotal = () => {
        const newTotal = calculateTotal(); // Tính lại số tiền tổng cộng
        setTotal2(newTotal); // Cập nhật state số tiền tổng cộng mới
    };

    const [addressOption, setAddressOption] = useState<string>('default');
    const [customAddress, setCustomAddress] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');

    const handleAddressOptionChange = (e) => {
        setAddressOption(e.target.value);
    };

    return (
        <div className='container-cart'>
            <div className='tit-left'>
                <div className="tit-cart">
                    <p>GIAO HÀNG MIỄN PHÍ</p>
                    <p>Áp dụng cho đơn hàng từ 5.000.000đ trở lên.</p>
                </div>
                <br />
                <h2 className='text-2xl'>Cái túi</h2>

                {aggregatedCartItems.map((aggregatedItem, index) => {
                    const { productId, color, size, quantity } = aggregatedItem;

                    const course = courseData.find((course) => course.id === productId);
                    if (!course) {
                        return null;
                    }
                    let imageUrl = course.courseIMG;
                    if (Array.isArray(course.courseIMG) && course.courseIMG.length > 0) {
                        imageUrl = course.courseIMG[0];
                    }
                    const price = parseFloat(course.price);
                    const productQuantity = productQuantities[productId] || quantity;

                    const handleIncrease = () => {
                        updateProductQuantity(productId, productQuantity + 1);
                    };

                    const handleDecrease = () => {
                        if (productQuantity > 1) {
                            updateProductQuantity(productId, productQuantity - 1);
                        }
                    };

                    return (
                        <div className="cart-product mt-5" key={index}>
                            <div><img style={{ width: 150 }} src={imageUrl} alt="" /></div>
                            <div>
                                <div className='flex justify-between w-m'>
                                    <h2>{course.courseName}</h2>
                                    <h2>{(price * productQuantity).toLocaleString()}₫</h2>
                                </div>
                                <p className='text-gray-500'>Màu sắc: {color}</p>
                                <p className='text-gray-500'>Kích cỡ: {size}</p>
                                <div className='text-gray-500'>Số lượng:
                                    <button onClick={handleDecrease}>-</button>
                                    {productQuantity}
                                    <button onClick={handleIncrease}>+</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className='tit-right'>
                <br />
                <h2 className='text-3xl font-medium'>Bản tóm tắt</h2>

                <div className="countc-cart mt-10">
                    <div className="flex justify-between items-center gap-5">
                        <p className='text-lg'>Tổng phụ: </p>
                        <p>{calculateTotal().toLocaleString()} ₫</p>
                    </div>
                    <div className="flex justify-between items-center gap-5">
                        <p className='text-lg'>Ước tính giao hàng và xử lý:</p>
                        <p>{parseFloat(total2.toFixed(2)).toLocaleString()} ₫</p>
                    </div>
                    <br /> <hr />
                    <div className="flex justify-between items-center gap-5 mt-3">
                        <p className='text-lg'>Tổng cộng </p>
                        {discountCode ? (
                            <p>{total2.toLocaleString()} ₫</p>
                        ) : (
                            <p>{(calculateTotal() + 250000).toLocaleString()} ₫</p>
                        )}
                    </div>
                    <div className="payment-options">
                        <br />
                        <Radio.Group onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
                            <Radio value="tienmat">Thanh toán tiền mặt</Radio>
                            <Radio value="banking">VN Pay</Radio>
                        </Radio.Group>
                    </div>
                    <div className='payment-options'>
                        <br />
                        <Radio.Group onChange={handleAddressOptionChange} value={addressOption}>
                            <Radio value="default">Địa chỉ mặc định</Radio>
                            <Radio value="custom">Nhập địa chỉ mới</Radio>
                        </Radio.Group>
                        {addressOption === 'custom' && (
                            <div>
                                <Input
                                    className='mb-3'
                                    placeholder="Nhập địa chỉ mới"
                                    value={customAddress}
                                    onChange={(e) => setCustomAddress(e.target.value)}
                                /> <br />
                                <Input
                                    placeholder="Nhập số điện thoại"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <br />
                    <div className="discount-section flex  gap-3">
                        <Input
                            placeholder="Nhập mã giảm giá nếu có"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <Button type="dashed" onClick={applyDiscount}>Áp dụng</Button>
                    </div>
                    <button className='thanhtoangio' onClick={handleCheckout}>Thanh toán giỏ hàng</button>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
