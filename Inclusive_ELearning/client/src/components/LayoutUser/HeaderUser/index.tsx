import React, { useEffect, useState, ChangeEvent } from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { firebaseConfig } from '@/components/GetAuth/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import './HeaderUser.css'
import { Link } from 'react-router-dom';
import { getCookie } from '@/components/Cookie/cookieUtils';


let userRole = 1
const roleCookie = getCookie('role');
if (roleCookie) {
    userRole = parseInt(roleCookie, 10);
}
console.log(userRole);


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const HeaderUser: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [isListVisible, setListVisible] = useState<boolean>(false);
    const [isSwapOn, setIsSwapOn] = useState(false); // Thêm state mới
    const [email, setEmail] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userId, setUserID] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userNotes, setUserNotes] = useState<any[]>([]);
    const [courseData, setCourseData] = useState<any[]>([]);

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => {
            unsubscribe();
        };
    }, [auth]);


    useEffect(() => {
        fetch('http://localhost:3000/Courses')
            .then((response) => response.json())
            .then((data: any[]) => {
                setProducts(data);
                setFilteredProducts(data);
            });
    }, []);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);
        handleSearch();
    };

    const handleClearSearch = (e: any) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form
        setListVisible(false);
        setSearchTerm(''); // Xóa dữ liệu trong input
    };
    const handleSearch = () => {
        const firstChar = searchTerm.charAt(0);
        const filtered = products.filter((product) =>
            product.courseName.toLowerCase().startsWith(firstChar.toLowerCase()) && !product.isHidden
        );
        setFilteredProducts(filtered.slice(0, 5));
        setListVisible(filtered.length > 0);
    };
    const handleItemClick = (product: any) => {
        navigate(`/introduction/${product.id}`);
    };
    const [isBackgroundChanged, setIsBackgroundChanged] = useState(false);


    useEffect(() => {
        const elementsToChange = document.querySelectorAll('.header-static, .other-class-1, .other-class-2');
        elementsToChange.forEach(element => { });
    }, [isBackgroundChanged]);

    const deleteCookie = (name: any) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    };

    const [cartItemCount, setCartItemCount] = useState<number>(0);

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:3000/notes`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch cart items.');
                    }
                })
                .then(data => {
                    // Lọc ra các mục có userID trùng với giá trị của userId
                    const cartItems = data.filter((item: any) => item.userID === userId);
                    // Tính tổng số lượng sản phẩm trong giỏ hàng
                    const itemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
                    setCartItemCount(itemCount);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }, [userId]);
    return (
        <div className='header-static'>
            <header>
                <div className="containerCss flex-hd">
                    <div className="box1">
                        <div className="logo">
                            <a href="http://localhost:5173/homepage"> <img style={{width:100}} src="https://kingshoes.vn/data/upload/media/cua-hang-giay-sneaker-chinh-giay-uy-tin-nhat-den-king-shoes-authenti-hcm-2-1624430336.png" alt="logo website" /></a>
                        </div>
                    </div>
                    <div className="box2">
                        <div className="left">
                            <a href="http://localhost:5173/listcourse"><i className="fa-solid fa-list lups"></i></a>
                            <div className="bolder-css">
                                <form action="">
                                    <input
                                        placeholder='Bạn muốn tìm kiếm sản phẩm gì?'
                                        type="text"
                                        value={searchTerm}
                                        onInput={handleInputChange}
                                    />
                                    {searchTerm && (
                                        <button onClick={(e) => handleClearSearch(e)} className="clear-button">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    )}
                                    <button onClick={handleSearch}>
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </button>
                                    {isListVisible && (
                                        <div className="search-results">
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map((product) => (
                                                    // Kiểm tra điều kiện isHidden trước khi hiển thị
                                                    !product.isHidden && (
                                                        <a href={`/introduction/${product.id}`} key={product.id}>
                                                            <div className='flex search-list'>
                                                                <div> <img className='w-5' src={product.courseIMG} alt="" /></div>
                                                                <div className='search-blue' onClick={() => handleItemClick(product)}>
                                                                    {product.courseName}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    )
                                                ))
                                            ) : (
                                                <div className="empty-result">Không tìm thấy!</div>
                                            )}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                        <div className="right">
                            <ul>
                                <li style={{ color: 'gray' }}>
                                    <a className='thea' href="http://localhost:5173/homepage">
                                        <i className="fa-solid fa-house lups"></i>
                                        <div>Trang chủ</div>
                                    </a>
                                </li>
                                <li style={{ color: 'gray' }}>
                                    <a className='thea' href="http://localhost:5173/mylearning/progress">
                                        <i className="fa-regular fa-file lups"></i>
                                        <div>Đơn hàng của tôi</div>
                                    </a>
                                </li>
                                <li>
                                    <div className='thea dropdown dropdown-bottom'>
                                        <label tabIndex={0} className="dropdown"><i className="fa-regular fa-user lups tutut"></i>   </label>
                                        <label className="">
                                            <div tabIndex={0} className="cursor-pointer mt-1">
                                                Tôi <i tabIndex={0} className={'fa-solid fa-caret-down'}></i>
                                            </div>
                                        </label>

                                        <div className="absolute top-1 left-36">
                                            <div className="dropdown">
                                                <div className="dropdown dropdown-bottom dropdown-end mt-5" onClick={(e) => e.stopPropagation()}>
                                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 right-0 mt-8">
                                                        <div className="flex justify-center items-center">
                                                            <li className="text-center ttf">
                                                                <div className="avatar online">
                                                                    <div className="w-10 rounded-full">
                                                                        {user && user.photoURL ? (
                                                                            <img src={user.photoURL} alt="Ảnh đại diện" />
                                                                        ) : (
                                                                            <img src="https://cdn2.iconfinder.com/data/icons/web-mobile-2-1/64/user_avatar_admin_web_mobile_business_office-512.png" alt="Ảnh mặc định" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        </div>
                                                        {user && user.uid ? (
                                                            <div className='testtt'>
                                                                <li >
                                                                    <Link to={`/Profile/${user.uid}`}>
                                                                        <Button style={{ width: 170 }}>
                                                                            Profile
                                                                        </Button>
                                                                    </Link>

                                                                </li>
                                                                {userRole === 1 && (
                                                                    <li>
                                                                        <Link to={`/admin`}>
                                                                            <Button style={{ width: 170 }}>
                                                                                Admin Profile
                                                                            </Button>
                                                                        </Link>
                                                                    </li>
                                                                )}
                                                                <li>
                                                                    <Link to={`/Postpage/`}>
                                                                        <Button style={{ width: 170 }}>Thảo luận</Button>
                                                                    </Link>

                                                                </li>
                                                                <li>
                                                                    <Button style={{ width: 170 }} onClick={() => {
                                                                        deleteCookie('role');
                                                                        auth.signOut();
                                                                        console.log('Xóa thành công');

                                                                        navigate('/')
                                                                    }}><i className="fa-solid fa-right-from-bracket ml-14"></i></Button>
                                                                </li>
                                                            </div>
                                                        ) : null}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </li>
                                <li className='relative' style={{ color: 'gray' }}>
                                    <a className='thea' href="http://localhost:5173/cartpage">
                                    <i className="fa-solid fa-cart-shopping mt-1" style={{fontSize:30}}></i>
                                    <div className='countSop'>{cartItemCount}</div> {/* Hiển thị số lượng sản phẩm */}
                                    </a>
                                </li>
                            </ul>
                            <div className='freemonth'>
                                <a href="/signup">Bắt đầu mua sắm</a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <nav>
                <div className="containerCss">
                    <div> Tìm kiếm theo: </div>
                    <ul>
                        <li><a href="">Nike</a></li>
                        <li><a href="">Vans</a></li>
                        <li><a href="">Adidas</a></li>
                        <li><a href="">| <span className='mr-3'></span> Buy the shoe</a></li>
                    </ul>
                </div>
            </nav>
        </div>
    )
}

export default HeaderUser