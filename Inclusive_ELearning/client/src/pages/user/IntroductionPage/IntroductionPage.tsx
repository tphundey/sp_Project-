import './introduction.css'
import React, { useEffect, useId, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import Input from 'antd/es/input/Input';
import { useNavigate, useParams } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { Form, Button, notification, Skeleton, message, Modal, Select, InputNumber } from 'antd';
import { Rating, Typography } from "@material-tailwind/react";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { renderReviewRateIcon } from '../../../components/RatingIcon/ratingIcons';
import { generateTimelineItems } from '@/components/TimeLineItem/TimeLineItem';
import { firebaseConfig } from '@/components/GetAuth/firebaseConfig';
import { Image } from 'antd';
import { formatCurrency } from '../../../components/FormatCurency/formatCurency';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const IntroductionPage = () => {

    const [user, setUser] = useState<any | null>(null);
    const [userEmail, setuserEmail] = useState<any | null>(null);
    const [rated, setRated] = React.useState<number>(4);
    const [product, setProduct] = useState<any>({});
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [review, setReview] = useState({ rating: 4, comment: '' });
    const [users, setUsers] = useState<any[]>([]);
    const { id }: { id?: string } = useParams();
    const courseID: number | undefined = id ? parseInt(id, 10) : undefined;
    const [ratingCounts, setRatingCounts] = useState<{ [key: number]: number }>({});
    const [canDisplayForm, setCanDisplayForm] = useState<boolean>(false);
    const [userID, setUserID] = useState<number | null>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
    const [currentVideo, setCurrentVideo] = useState<any>(null);
    const timelineItems = generateTimelineItems(videos);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [totalReviews, setTotalReviews] = useState(0);
    const [amount, setAmount] = useState(0);
    const [paymentCount, setPaymentCount] = useState(0);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [userIdfirebase, setuserIdfirebase] = useState<any | null>(null);
    const [paymentData2, setPaymentData2] = useState([]);
    const [numberOfMatchingPayments, setNumberOfMatchingPayments] = useState(0);
    const existingCourseId = id;
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/Payment')
            .then(response => response.json())
            .then(data => setPaymentData2(data))
            .catch(error => console.error('Error fetching payment data:', error));
    }, []);

    useEffect(() => {
        const filtered = paymentData2.filter(payment => payment.courseId === existingCourseId);
        setNumberOfMatchingPayments(filtered.length);
    }, [existingCourseId, paymentData2]);

    useEffect(() => {
        console.log('Tổng số mảng có courseId trùng:', numberOfMatchingPayments);
    }, [numberOfMatchingPayments]);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setuserEmail(currentUser?.email)
            setuserIdfirebase(currentUser?.uid)
        });
        return () => {
            unsubscribe();
        };
    }, [auth]);


    if (userIdfirebase) {
        const getUserIdByUid = async (uid) => {
            try {
                const response = await fetch(`http://localhost:3000/googleAccount`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const userData = await response.json();

                    // Lọc ra tất cả các tài khoản có uid trùng với uid được chỉ định
                    const matchingUsers = userData.filter(user => user.userId === uid);
                    console.log(matchingUsers);

                    if (matchingUsers.length > 0) {
                        // Chọn tài khoản đầu tiên trong danh sách (nếu có nhiều tài khoản trùng uid)
                        const userId = matchingUsers[0].id;
                        return userId;
                    } else {
                        console.log('User not found');
                        return null;
                    }
                } else {
                    throw new Error('Failed to fetch user data.');
                }
            } catch (error) {
                console.error('Error:', error);
                return null;
            }
        };
        // Example usage
        const uid = userIdfirebase;
        getUserIdByUid(uid)
            .then(userId => {
                if (userId) {
                    setIduser(userId)
                    console.log('User ID:', userId);
                } else {
                    console.log('User ID not found');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    var [iduser, setIduser] = useState(0);
    const [paymentData, setPaymentData] = useState([]);
    const [paymentStatu2s, setPaymentStatus2] = useState(false);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                const response = await fetch('http://localhost:3000/payment', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const allPaymentData = await response.json();
                    setPaymentData(allPaymentData);

                    // Kiểm tra xem có bản ghi thanh toán tương ứng với productId và userId không
                    const isAnyPaymentRecord = allPaymentData.some(record => {
                        // Kiểm tra xem trường items là một mảng hay không
                        let itemsArray;
                        if (typeof record.items === 'string') {
                            itemsArray = JSON.parse(record.items);
                        } else {
                            itemsArray = record.items;
                        }
                        return itemsArray.some(item => item.productId === id) && record.userId === userID;
                    });

                    setPaymentStatus2(isAnyPaymentRecord); // Set trạng thái đã mua là true nếu có ít nhất một bản ghi, ngược lại là false
                } else {
                    throw new Error('Failed to fetch payment data.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        checkPaymentStatus();
    }, [id, userID]); // Dependency on id and userId

    console.log(userID, '555555555555555555555555');



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch course data
                const courseResponse = await axios.get(`http://localhost:3000/Courses/${id}`);
                const productData = courseResponse.data;
                setAmount(courseResponse.data.price)
                setProduct(productData);

                // Fetch all videos
                const allVideosResponse = await axios.get(`http://localhost:3000/Videos`);
                const allVideos = allVideosResponse.data;

                const filteredVideos = allVideos.filter((video: any) => {
                    return video.courseId === id;
                });

                setVideos(filteredVideos);

                if (filteredVideos.length > 0) {
                    setSelectedVideoUrl(filteredVideos[0].videoURL);
                    setCurrentVideo(filteredVideos[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id]);




    ///////////////////////// Láy thông tin danh mục///////////////////////////
    useEffect(() => {
        axios.get('http://localhost:3000/Categories')
            .then((response) => {
                if (response.status === 200) {
                    const categories = response.data;
                    const matchedCategory = categories.find((category: any) => category.id === product.categoryID);
                    if (matchedCategory) {
                        setCategoryName(matchedCategory.categoryName);
                        setTimeout(() => {
                            setLoading(false);
                        }, 1000);
                    }
                }
            })
            .catch((error) => {
                console.error('Lỗi khi tải dữ liệu Categories:', error);
            });
    }, [product.categoryID]);


    ////////////////////Lấy thông tin tài khoản google dựa theo Email////////////////////
    fetch(`http://localhost:3000/googleAccount?email=${userEmail}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to retrieve user ID from the API.');
            }
        })
        .then((data) => {
            const user = data.find((item: any) => item.email === userEmail);
            const userID = user.id;
            setUserID(userID);

        })
        .catch((error) => {
            console.error(error);
        });

    fetch(`http://localhost:3000/googleAccount?email=${userEmail}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to retrieve user information from the API.');
            }
        })
        .then((userData) => {
            if (userData) {
                console.log(userData[0].lock);

                const lock = userData[0].lock;

                // Kiểm tra trường lock và đăng xuất tài khoản nếu lock là true
                if (lock == true) {
                    // Thực hiện đăng xuất tài khoản
                    auth.signOut().then(() => {
                        messageApi.open({
                            type: "error",
                            content: "Bạn đã bị chặn tài khoản ! Vui lòng chú ý hơn",
                        });
                        navigate('/')
                    }).catch((error) => {
                        console.error('Lỗi khi đăng xuất:', error);
                    });
                } else {
                    // Nếu lock không phải là true, có thể tiếp tục thực hiện các thao tác khác
                    console.log('Tài khoản không bị khóa. Tiếp tục thực hiện các thao tác khác.');
                }
            } else {
                console.error('Không tìm thấy thông tin tài khoản với ID đã cung cấp.');
            }
        })
        .catch((error) => {
            console.error(error);
        });

    ////////////////////Lấy thông tin thanh toán////////////////////
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`http://localhost:3000/Payment`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data from the API.');
                }
                const data = await response.json();
                if (data) {
                    const payment = data.find((item: any) => item.courseID === id && item.userID === userID && item.payment_status === true && item.status2 === "Đã thanh toán");
                    if (payment) {
                        setCanDisplayForm(true);
                    }
                } else {
                    console.log('Dữ liệu không hợp lệ hoặc không có thuộc tính Payment.');
                }
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            }
        }
        fetchData();
    }, [courseID, userID]);



    ////////////////////Lấy thông tin đánh giá ////////////////////
    useEffect(() => {
        axios.get(`http://localhost:3000/Reviews?courseID=${id}`)
            .then((response) => {
                console.log(response.data);
                setReviews(response.data);

            })
            .catch((error) => {
                console.error(error);
            });
    }, [id]);;


    ////////////////////Lấy thông tin số rate////////////////////
    useEffect(() => {
        const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((review) => {
            counts[review.rating] += 1;
        });
        setRatingCounts(counts);
    }, [reviews]);

    const handleDiscountSubmit = () => {

        setShowDiscountPopup(false);
    };

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showDiscountPopup, setShowDiscountPopup] = useState(false);
    const [discountCode, setDiscountCode] = useState('');

    const showModal = () => {
        setIsModalVisible(true);
        handleBuyButtonClick()
    };





    ////////////////////Thay đổi số rate////////////////////
    const handleRatingChange = (value: any) => {
        setReview({ ...review, rating: value });
        setRated(value);
    };
    const [iframeUrl, setIframeUrl] = useState('');
    useEffect(() => {
        if (id) {
            const stringId = id.toString();
            const apiUrl = `http://localhost:3000/Courses/${stringId}`;
            axios
                .get(apiUrl)
                .then((response) => {
                    setProduct(response.data);
                    console.log(response.data.intro);
                    setIframeUrl(response.data.intro)

                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [id]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = 'http://localhost:3000/Courses';
                const response = await axios.get(apiUrl);

                if (product.categoryID) {
                    // Nếu có categoryID, lọc ra các sản phẩm có categoryID trùng khớp
                    const filteredProducts = response.data.filter(course => course.categoryID === product.categoryID);
                    setSimilarProducts(filteredProducts);
                } else {
                    // Nếu không có categoryID, hiển thị tất cả sản phẩm
                    setSimilarProducts(response.data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [product.categoryID]);



    useEffect(() => {
        axios.get(`http://localhost:3000/Reviews?courseID=${id}`)
            .then((response) => {
                setReviews(response.data.reverse());
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

        axios
            .get('http://localhost:3000/googleAccount')
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [id]);



    //////////////////// Lấy ra tổng số đánh giá///////////////////////
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/Reviews?courseID=${id}`);
                const allReviews = response.data;
                setReviews(allReviews);
                const totalReviews = allReviews.length;
                setTotalReviews(totalReviews); // Cập nhật tổng số đánh giá

            } catch (error) {
                console.error(error);
            }
        };
        fetchReviews();
    }, [id]);


    function findUserById(userID: any) {
        return users.find((user) => user.id === userID);
    }

    function calculateAverageRating(reviews: any) {
        if (reviews && reviews.length > 0) {
            const totalRating = reviews.reduce(
                (accumulator: any, review: any) => accumulator + review.rating,
                0
            );
            const averageRating = totalRating / reviews.length;
            return averageRating.toFixed(1); // Giới hạn số thập phân
        }
        return 0;
    }

    function convertToStarRating(averageRating: string) {
        const maxStars = 5;
        const fullStars = Math.floor(parseFloat(averageRating));
        const halfStar = parseFloat(averageRating) % 1 !== 0;
        const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

        const starRating = [];
        for (let i = 0; i < fullStars; i++) {
            starRating.push('★');
        }
        if (halfStar) {
            starRating.push('☆');
        }
        for (let i = 0; i < emptyStars; i++) {
            starRating.push('☆');
        }
        return starRating.join(' ');
    }

    const averageRating = calculateAverageRating(reviews);
    const starRating: string = convertToStarRating(averageRating.toString());


    const postReview = () => {
        const swearWords = ['shit', 'fuck', 'cc'];
        const containsSwearWord = swearWords.some(word =>
            review.comment.toLowerCase().includes(word.toLowerCase())
        );

        if (containsSwearWord) {
            message.warning('Vui lòng không sử dụng ngôn từ không phù hợp!');
            return;
        }
        if (userEmail) {
            // Lấy thông tin người dùng từ API bằng email
            fetch(`http://localhost:3000/googleAccount?email=${userEmail}`)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Lấy thông tin người dùng từ API thất bại.');
                    }
                })
                .then((userData) => {
                    const javascriptUserID = userData[0].id;

                    if (typeof id === 'string') {

                        const hasUserReviewed = reviews.some(
                            (review) => review.courseID === id && review.userID === javascriptUserID
                        );

                        if (hasUserReviewed) {
                            notification.warning({
                                message: 'Lỗi',
                                description: 'Bạn đã đăng đánh giá cho sản phẩm này rồi.',
                                placement: 'topRight',
                            });
                        } else if (!review.rating || review.rating === 0) {
                            notification.error({
                                message: 'Lỗi',
                                description: 'Bạn chưa lựa chọn số rate.',
                                placement: 'topRight',
                            });
                        } else if (!review.comment) {
                            notification.error({
                                message: 'Lỗi',
                                description: 'Bạn chưa nhập comment.',
                                placement: 'topRight',
                            });
                        } else {

                            const currentDate = moment().tz('Asia/Ho_Chi_Minh');
                            const formattedDate = currentDate.format('YYYY-MM-DD');

                            const dataToPost = {
                                rating: review.rating,
                                comment: review.comment,
                                userID: javascriptUserID,
                                courseID: id,
                                date: formattedDate,
                            };

                            axios
                                .post('http://localhost:3000/Reviews', dataToPost)
                                .then((response) => {
                                    console.log('Đánh giá đã được đăng thành công', response.data);
                                    setReviews([...reviews, dataToPost]);
                                    setRatingCounts((prevCounts) => {
                                        const updatedCounts = { ...prevCounts };
                                        updatedCounts[review.rating] = updatedCounts[review.rating] + 1;
                                        return updatedCounts;
                                    });
                                    setReview({ rating: 0, comment: '' });
                                })
                                .catch((error) => {
                                    console.error('Lỗi khi đăng đánh giá', error);
                                });
                        }
                    } else {
                        console.error('Lỗi: ID không phải là một chuỗi hợp lệ.');
                    }
                })
                .catch((error) => {
                    console.error('Lỗi khi kiểm tra thông tin người dùng', error);
                });
        } else {
            console.error('Lỗi: Email người dùng không được xác định.');
        }
    };

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const sizes = [
        { id: 1, label: '36', value: 'size_36' },
        { id: 2, label: '37', value: 'size_37' },
        { id: 3, label: '38', value: 'size_38' },
        { id: 4, label: '39', value: 'size_39' },
        { id: 5, label: '40', value: 'size_40' },
        { id: 6, label: '41', value: 'size_41' },
        // Thêm các kích cỡ khác tương tự nếu cần
    ];


    const handleAddToCart = () => {
        // Validate color, size, and quantity
        if (!selectedColor) {
            message.error('Please select color');
            return;
        }
        if (!selectedSize) {
            message.error('Please select size');
            return;
        }
        if (!quantity || quantity < 1) {
            message.error('Please enter a valid quantity');
            return;
        }
        if (userIdfirebase) {
            const getUserIdByUid = async (uid) => {
                try {
                    const response = await fetch(`http://localhost:3000/googleAccount`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();

                        // Lọc ra tất cả các tài khoản có uid trùng với uid được chỉ định
                        const matchingUsers = userData.filter(user => user.userId === uid);
                        console.log(matchingUsers);

                        if (matchingUsers.length > 0) {
                            // Chọn tài khoản đầu tiên trong danh sách (nếu có nhiều tài khoản trùng uid)
                            const userId = matchingUsers[0].id;
                            return userId;
                        } else {
                            console.log('User not found');
                            return null;
                        }
                    } else {
                        throw new Error('Failed to fetch user data.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    return null;
                }
            };
            // Example usage
            const uid = userIdfirebase;
            getUserIdByUid(uid)
                .then(userId2 => {
                    if (userId2) {
                        setIduser(userId2)
                        if (quantity > product.soluong) {
                            message.error('Số lượng chọn vượt quá số lượng trong kho');
                            return;
                        }
                        const data = {
                            productId: product.id,
                            color: selectedColor,
                            size: selectedSize,
                            quantity: quantity,
                            userID: userId2
                        };

                        // Gửi yêu cầu POST đến API
                        axios.post('http://localhost:3000/notes', data)
                            .then(response => {
                                // Xử lý phản hồi từ API khi cần
                                console.log('Đã thêm vào giỏ hàng:', response.data);
                                setIsModalVisible(false);
                                message.success('Đã thêm vào giỏ hàng');
                                window.location.href = '/cartpage';
                            })
                            .catch(error => {
                                console.error('Lỗi khi thêm vào giỏ hàng:', error);
                                message.error('Đã xảy ra lỗi');
                            });
                        console.log('User ID:', userId2);
                    } else {
                        console.log('User ID not found');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });

        }

    };



    useEffect(() => {
        // Lấy danh sách đánh giá của người dùng từ API
        axios.get(`http://localhost:3000/Reviews?userID=${userEmail}&courseID=${id}`)
            .then((response) => {
                setUserReviews(response.data);

            })
            .catch((error) => {
                console.error(error);
            });
    }, [userEmail, id]);


    const [showFullDescription, setShowFullDescription] = useState(false);
    const maxLength = 500;
    const defaultDescription = product.description;
    const description = defaultDescription || '';
    const truncatedDescription = showFullDescription ? description : description.slice(0, maxLength) + '...';
    const truncateProductName = (name: any, maxLength: any) => {
        return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
    };
    const [colors, setColors] = useState([]);


    useEffect(() => {
        const fetchCourseColors = async () => {
            try {
                const response = await fetch(`http://localhost:3000/Courses/${id}`);
                const data = await response.json();
                // Kiểm tra nếu mausac là một mảng, nếu không thì chuyển thành mảng gồm một phần tử
                setColors(Array.isArray(data.mausac) ? data.mausac : [data.mausac]);
            } catch (error) {
                console.error('Error fetching course colors:', error);
            }
        };

        fetchCourseColors();

        // Cleanup function
        return () => {
            // Perform any cleanup if needed
        };
    }, [id]);

    const shuffleArray = (array: any) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    };
    const [shuffledSimilarProducts, setShuffledSimilarProducts] = useState<any[]>([]);

    useEffect(() => {
        setShuffledSimilarProducts(shuffleArray(similarProducts));
    }, [similarProducts]);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/Courses/${id}`);
                const data = await response.json();
                setColors(data.mausac || []);
                setImages(data.courseIMG || []);
            } catch (error) {
                console.error('Error fetching course data:', error);
            }
        };

        fetchCourseData();
        return () => {
        };
    }, [id]);
    const renderedSimilarProducts = shuffledSimilarProducts.slice(0, 7).map((similarProduct: any) => (
        <li key={similarProduct.id} className="prosimi flex items-start gap-4 px-4 py-3">
            <div className="flex items-center shrink-0">
                <img src={similarProduct.courseIMG[0]} alt="product image" className="w-20 h-28 tesl rounded" />
            </div>
            <div className="flex flex-col gap-0 min-h-[2rem] items-start justify-center w-full min-w-0">
                <h4 className='text-xs'>New</h4>
                <h4 className="text-base text-slate-700 font-medium">
                    <a href={`/introduction/${similarProduct.id}`}>
                        <p className="mt-1 text-base">{truncateProductName(similarProduct.courseName, 41)}</p>
                    </a>
                </h4>
                <p className="w-full text-xs text-slate-500 mt-3">{formatCurrency(similarProduct.price)}</p>

            </div>
        </li>
    ));

    if (loading) {
        return <Skeleton active />;
    }
    const formattedPrice = formatCurrency(product.price);


    return (
        <div className="containerCss">
            <div className="course-header-container">
                <div className="course-overview-header">
                    <div className="courseLeft">
                        <a className='courseLeft-ah1' href="">{product.courseName}</a>
                        <div className="course-span-left mt-3">
                            <span>Tên thương hiệu: <b>{categoryName}</b></span>
                            <span className='mb-1 font-bold'>.</span>
                            <span>Chất liệu: {product.chatlieu}</span>
                            <span className='mb-1 font-bold'>.</span>
                            <span>Số lượng trong kho: {product.soluong} chiếc</span>
                        </div>
                        <div className='flex mt-3'>
                            <p className='mr-3'> Màu sắc:  </p>
                            {colors.map((color, index) => (
                                <div key={index} style={{ backgroundColor: color, width: '30px', height: '30px', marginRight: '10px', borderRadius: '40pc' }}></div>
                            ))}
                        </div>
                        <div className="course-span-leftx">
                            <div className='mt-1'>{averageRating}</div>
                            <div className='starrev' id="starRating">{starRating}</div>
                            <div className='mt-1'>({reviews.length})</div>
                            <div className='mt-1'><span> Đã mua</span></div>
                        </div>
                        <div className='flex pro-ull'>
                            {images.map((image, index) => (
                                <Image key={index} src={image} alt={`Image ${index}`} style={{ width: '100px', height: '100px', marginRight: '10px', borderRadius: '100px' }} />
                            ))}
                        </div>
                        <div className='flex gap-4 intro-bt'>
                            {/* <Link to={`/content/${id}`}>
                                <button className='intro-bt1'>Thêm giỏ hàng</button>
                            </Link> */}
                            <div className="product">
                                <button className='intro-bt1' onClick={() => setIsModalVisible(true)}>Thêm vào giỏ hàng</button>
                                <Modal
                                    title="Chọn màu sắc, kích cỡ và số lượng"
                                    visible={isModalVisible}
                                    onOk={handleAddToCart}
                                    onCancel={() => setIsModalVisible(false)}
                                >
                                    <p>Màu sắc:</p>
                                    <Select className='w-20' value={selectedColor} onChange={value => setSelectedColor(value)}>
                                        {colors.map(color => (
                                            <Option key={color} value={color}>{color}</Option>
                                        ))}
                                    </Select>
                                    <p>Kích cỡ:</p>
                                    <Select className='w-20' value={selectedSize} onChange={value => setSelectedSize(value)}>
                                        {sizes.map(size => (
                                            <Option key={size.id} value={size.value}>{size.label}</Option>
                                        ))}
                                    </Select>
                                    <p>Số lượng:</p>
                                    <InputNumber min={1} value={quantity} onChange={value => setQuantity(value)} />
                                </Modal>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="imgHid">
                {images.length > 0 && (
                    <img src={images[0]} alt={`Image 0`} />
                )}
            </div>
            <hr />
            <div className="flex">
                <div className="course-body-intro">
                    <span className='course-intro-sp1'>Bao gồm những: </span>
                    <div className="included-phone">
                        <div><i className="fa-solid fa-mobile-screen ml-1"></i> Có thể truy cập bằng điện thoại hoặc tablet</div>
                        <div><i className="fa-regular fa-newspaper"></i>Freeship nội thành khu vực Hà Nội</div>
                    </div>
                    <div className="courseDescription">
                        <div className="titleCourseDescription">Miêu tả sản phẩm: </div>
                        <p>
                            {truncatedDescription}
                            {description.length > maxLength && (
                                <span onClick={() => setShowFullDescription(!showFullDescription)} style={{ color: 'blue', cursor: 'pointer' }}>
                                    {' '}
                                    {showFullDescription ? 'Thu gọn' : 'Xem tiếp'}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="courseDescription">

                        <div className='font-medium text-xl mt-6'>
                            Cửa hàng
                        </div>
                        <div className="instructors">
                            <div className="instructors-children">
                                <div className="instruc-left">
                                    <img src="https://kingshoes.vn/data/upload/media/cua-hang-giay-sneaker-chinh-giay-uy-tin-nhat-den-king-shoes-authenti-hcm-2-1624430336.png" alt="" />
                                </div>
                                <div className="instruc-right">
                                    <h1>Trần Thị Hương Trà</h1>
                                    <h3><a href="https://github.com/tphundey/Inclusive_ELearning">Link my store</a></h3>
                                </div>
                            </div>
                        </div>
                        <div className='font-medium text-xl mt-6'>
                            Người dùng đánh giá
                        </div>
                        <div className="flex">
                            <div className="overflow-hidden bg-white rounded shadow-md text-slate-500 shadow-slate-200">
                                <div className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className='preview'>
                                            <div className='mt-4'> <span><span className='text-4xl font-bold text-black'>{calculateAverageRating(reviews)}</span> out 5</span></div>
                                            <div className="flex items-center gap-2">
                                                <div className="mt-3">
                                                    <span className="text-sm rounded text-slate-500 ">
                                                        <span className="flex gap-1 text-amber-400" role="img" aria-label="Rating: 4 out of 5 stars">
                                                            <div className='starrev' id="starRating">{starRating}</div>
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className='mt-3'>
                                                    <span className="text-xs leading-6 text-slate-400">{reviews.length} Đánh giá</span>
                                                </div>
                                            </div>
                                        </div>

                                        <span className="flex flex-col w-full gap-4 pt-6">

                                            {/* Hiển thị biểu đồ thống kê ở đây */}
                                            {Object.keys(ratingCounts).map((rating) => (
                                                <span key={rating} className="flex items-center w-full gap-2">
                                                    <label id="p03e-label" className="mb-0 text-xs text-center w-9 shrink-0 text-slate-500"> {rating} sao</label>
                                                    <progress aria-labelledby="p03e-label" id="p03e" max="100" value="75" className="block h-3 w-full overflow-hidden rounded bg-slate-100 [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:bg-amber-400 [&::-moz-progress-bar]:bg-amber-400" max="100" value={(ratingCounts[parseInt(rating)] / reviews.length) * 100}> {(ratingCounts[parseInt(rating)] / reviews.length) * 100}%</progress>
                                                    <span className="text-xs font-bold w-9 text-slate-700">{ratingCounts[parseInt(rating)]}</span>
                                                </span>
                                            ))}

                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {paymentStatu2s ? (
                            <>
                                <Form className='mt-7 formReview' action="" method="post" >
                                    <div className="gap-2">
                                        <div className='flex items-center gap-2'>
                                            <Rating className='flex text-yellow-400'
                                                value={review.rating}
                                                onChange={handleRatingChange}
                                            />
                                            <Typography className="font-medium mb-4 text-yellow-400">
                                                {rated}.0
                                            </Typography>
                                        </div>
                                        <Input
                                            maxLength={40}
                                            value={review.comment}
                                            onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                        />
                                        <Button className='mt-4' type='dashed' onClick={postReview}>Đăng</Button>
                                    </div>
                                </Form>

                            </>
                        ) : (
                            <p className='text-white'>Người dùng chưa thanh toán khóa học.</p>
                        )}
                        {formattedPrice == '0 ₫' ? (
                            <>
                                <Form className='mt-7 formReview' action="" method="post" >
                                    <div className="gap-2">
                                        <div className='flex items-center gap-2'>
                                            <Rating className='flex text-yellow-400'
                                                value={review.rating}
                                                onChange={handleRatingChange}
                                            />
                                            <Typography className="font-medium mb-4 text-yellow-400">
                                                {rated}.0
                                            </Typography>
                                        </div>
                                        <Input
                                            value={review.comment}
                                            onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                        />
                                        <Button className='mt-4' type='dashed' onClick={postReview}>Đăng </Button>
                                    </div>
                                </Form>

                            </>
                        ) : (
                            <p className='text-white'>Người dùng chưa thanh toán khóa học.</p>
                        )}
                        <div className="listReviewIntro">
                            {reviews.map((review) => (
                                <div key={review.id} className="reviewIntroChildren">
                                    <div className="avatarReview">
                                        <img src={findUserById(review.userID)?.photoURL} alt="" />
                                    </div>
                                    <div className="desReview">
                                        <div className="desrv1">{findUserById(review.userID)?.displayName}</div>
                                        <div className="desrv2">{review.comment}</div>
                                        <div className="flex items-center gap-10">
                                            <div>{renderReviewRateIcon(review.rating)}</div>
                                            <div className="desrv4">{review.date}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='introducation-right'>

                    <h2 className='text-xl font-medium p-3 mt-10'>Sản phẩm cùng thương hiệu</h2>
                    <ul className="divide-y divide-slate-100">
                        {renderedSimilarProducts}
                        <hr />
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default IntroductionPage

function addToCart(arg0: { productId: any; color: string; size: string; quantity: number; }) {
    throw new Error('Function not implemented.');
}
