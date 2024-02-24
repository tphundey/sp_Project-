import './HomePage.css';
import { useEffect, useRef, useState } from 'react';
import { useGetProductsQuery } from "@/api/courses";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { formatCurrency } from '../../../components/FormatCurency/formatCurency';

const fetchCategoryData = async (productId: number): Promise<string | null> => {
    try {
        const response = await fetch(`http://localhost:3000/categories/${productId}`);
        if (response.ok) {
            const category = await response.json();
            return category.categoryName;
        } else {
            console.error('Error fetching category data:', response.status, response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching category data:', error);
        return null;
    }
};

const Homepage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const { data: productsData } = useGetProductsQuery();
    const [visibleProducts, setVisibleProducts] = useState<any[]>([]);
    const [visibleProducts2, setVisibleProducts2] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (productsData) {
                    const updatedVisibleProducts = await Promise.all(
                        productsData.map(async (product) => {
                            const categoryName = await fetchCategoryData(product.categoryID);
                            if (!product.isHidden) {
                                return { ...product, categoryName };
                            } else {
                                return null;
                            }
                        })
                    );
                    const filteredVisibleProducts = updatedVisibleProducts.filter(product => product !== null);
                    setVisibleProducts(filteredVisibleProducts);
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }

        };

        fetchData();
    }, [productsData]);



    useEffect(() => {
        const fetchData = async () => {
            if (productsData) {
                const updatedVisibleProducts = await Promise.all(
                    productsData.map(async (product) => {
                        const categoryName = await fetchCategoryData(product.categoryID);
                        if (!product.isHidden) {
                            return { ...product, categoryName };
                        } else {
                            return null;
                        }
                    })
                );
                const filteredVisibleProducts = updatedVisibleProducts.filter(product => product !== null);
                const shuffledProducts = shuffleArray(filteredVisibleProducts);
                setVisibleProducts2(shuffledProducts);
                setLoading(false)
            }
        };
        fetchData();
    }, [productsData]);

    const shuffleArray = (array: any[]) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    const settings = {
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 4,
    };
    const videoRef = useRef(null);
    const playButtonRef = useRef(null);

    useEffect(() => {
        // Gọi hàm mô phỏng sự kiện click của nút sau khi component được render
        playButtonRef.current.click();
    }, []);

    const playVideo = () => {
        // Kiểm tra xem video đã phát chưa trước khi bắt đầu phát
        if (videoRef.current.paused) {
            videoRef.current.play();
        }
    };
    return (
        <div>
            <div className='bn-height'>
                <div className="height-banner">
                    <button ref={playButtonRef} onClick={playVideo} style={{ display: 'none' }}></button>
                    <video width={1400} className="height-banner2" ref={videoRef}>
                        <source width={1400} className="height-banner2" src="https://videos.adidas.com/video/upload/if_w_gt_960,w_960/brand_SS_24_multisport_global_hp_mh_apac_t_bcf294075a.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>
            <div className="hd-b">
                <p className='tieude1'>HÃY NẮM BẮT CƠ HỘI</p>
                <p className='tieude2'>Khi bạn chơi thể thao theo cách riêng của mình, áp lực sẽ không bao giờ lên ngôi</p>
                <div className=' boder-inline'>
                    <button className='bg-white p-4 border-black'>Phát triển vượt bậc</button><i class="fa-solid fa-arrow-right"></i>
                </div>
            </div>
            <div className='homepage containerCss'>


                <div>
                    <div>
                        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-0">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sản phẩm dành cho bạn</h2>

                            <div className="product-slider">
                                {loading ? (
                                    <span className="loading loading-spinner text-info home-loading"></span>
                                ) : (
                                    <>
                                        <Slider {...settings}>
                                            {visibleProducts?.map((product: any, index: any) => {
                                                const formattedPrice = product.price !== 0 ? formatCurrency(product.price) : 'Free';
                                                const textColorClass = product.price !== 0 ? 'text-blue-400' : 'text-green-500';
                                                return (
                                                    <div className="group relative">
                                                        <div className="aspect-h-1 pro product-hp w-full h-full rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 product-slide">
                                                            <img src={product.courseIMG} alt="" />
                                                        </div>
                                                        <div className="mt-2">
                                                            <div>
                                                                <h3 className="text-xs text-gray-700">
                                                                    <span className="absolute inset-2 popular">New</span>
                                                                    {product.categoryName}
                                                                </h3>
                                                                <a href={`/introduction/${product.id}`} key={index}>
                                                                    <p className="mt-1 text-base">{product.courseName.substring(0, 70)}...</p>
                                                                </a>
                                                            </div>
                                                            <p className={`mt-1 ${textColorClass}`}>{formattedPrice}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </Slider>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div>
                        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-0">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sản phẩm nổi bật trong tuần</h2>

                            <div className="product-slider">
                                {loading ? (
                                    <span className="loading loading-spinner text-info home-loading"></span>
                                ) : (
                                    <>
                                        <Slider {...settings}>
                                            {visibleProducts2?.map((product: any, index: any) => {
                                                const formattedPrice = product.price !== 0 ? formatCurrency(product.price) : 'Free';
                                                const textColorClass = product.price !== 0 ? 'text-blue-400' : 'text-green-500';
                                                return (
                                                    <div className="group relative">
                                                        <div className="aspect-h-1 pro product-hp w-full h-full rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 product-slide">
                                                            <img src={product.courseIMG} alt="" />
                                                        </div>
                                                        <div className="mt-2">
                                                            <div>
                                                                <h3 className="text-xs text-gray-700">
                                                                    <span className="absolute inset-2 popular">New</span>
                                                                    {product.categoryName}
                                                                </h3>
                                                                <a href={`/introduction/${product.id}`} key={index}>
                                                                    <p className="mt-1 text-base">{product.courseName.substring(0, 70)}...</p>
                                                                </a>
                                                            </div>
                                                            <p className={`mt-1 ${textColorClass}`}>{formattedPrice}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </Slider>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='mb-20' />
                {/* End */}
            </div>
        </div>
    )

};

export default Homepage;