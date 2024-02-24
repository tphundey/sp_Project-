import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/components/FormatCurency/formatCurency';
import { Button, Select } from 'antd';
import './BrowsePage.css'
const { Option } = Select;

const ListCourse = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [visibleCourses, setVisibleCourses] = useState(5);
    const [sortOption, setSortOption] = useState('price_asc');
    const [priceRange, setPriceRange] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedColor, setSelectedColor] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3000/Courses')
            .then(response => response.json())
            .then(data => setCourses(data))
            .catch(error => console.error('Error fetching courses:', error));

        fetch('http://localhost:3000/Categories')
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    const handleShowMore = () => {
        setVisibleCourses(prev => prev + 5);
    };

    const handleSortChange = (option) => {
        setSortOption(option);
    };

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
    };

    const handleCategoryChange = (categoryID) => {
        setSelectedCategory(categoryID);
    };

    const handleColorChange = (color) => {
        setSelectedColor(color);
    };

    const filteredCourses = courses.filter(course => {
        let passesPriceFilter = true;
        if (priceRange !== 'all') {
            if (priceRange === '0-500k') {
                passesPriceFilter = course.price >= 0 && course.price <= 500000;
            } else if (priceRange === '500k-1m') {
                passesPriceFilter = course.price > 500000 && course.price <= 1000000;
            } else if (priceRange === '1m-2m') {
                passesPriceFilter = course.price > 1000000 && course.price <= 2000000;
            }
        }

        let passesCategoryFilter = true;
        if (selectedCategory !== 'all') {
            passesCategoryFilter = course.categoryID === selectedCategory;
        }

        let passesColorFilter = true;
        if (selectedColor) {
            if (course.mausac && Array.isArray(course.mausac)) {
                passesColorFilter = course.mausac.includes(selectedColor);
            } else {
                passesColorFilter = false; // Không có mảng màu hoặc mảng màu không tồn tại, không đáp ứng tiêu chí lọc
            }
        }

        return passesPriceFilter && passesCategoryFilter && passesColorFilter;
    });

    const sortedAndFilteredCourses = [...filteredCourses].sort((a, b) => {
        if (sortOption === 'price_asc') {
            return a.price - b.price;
        } else if (sortOption === 'price_desc') {
            return b.price - a.price;
        }
    });

    function handleBookmarkClick(id: any): void {
        throw new Error('Function not implemented.');
    }

    return (
        <div className="containerCss-browepage2 business">
            <div className='option-pro mt-5' >
                <label>
                    <b>Sắp xếp theo giá tiền:</b> <br /> <br />
                    <Select value={sortOption} onChange={handleSortChange}>
                        <Option value="price_asc">Giá tăng dần</Option>
                        <Option value="price_desc">Giá giảm dần</Option>
                    </Select>
                </label><br />
                <label>
                    <b>  Lọc theo giá tiền:</b>  <br /> <br />
                    <Select style={{ width: 200 }} open value={priceRange} onChange={handlePriceRangeChange}>
                        <Option value="all">Tất cả</Option>
                        <Option value="0-500k">Từ 0 đến 500k</Option>
                        <Option value="500k-1m">Từ 500k đến 1 triệu</Option>
                        <Option value="1m-2m">Từ 1 triệu đến 2 triệu</Option>
                    </Select>
                </label> <br /><br /><br /><br /><br /><br /><br />
                <label>
                    <b>  Lọc theo danh mục:</b>  <br /> <br />
                    <Select value={selectedCategory} onChange={handleCategoryChange}>
                        <Option value="all">Tất cả</Option>
                        {categories.map(category => (
                            <Option key={category.id} value={category.id}>{category.categoryName}</Option>
                        ))}
                    </Select>
                </label> <br />
                <label>
                    <b>  Lọc theo bảng màu: </b> <br /> <br />
                    <Select style={{ width: 120 }} value={selectedColor} onChange={handleColorChange} open dropdownClassName="dropdown-below">
                        <Option value="">Tất cả</Option>
                        <Option value="Red">🟥 Đỏ</Option>
                        <Option value="Blue">🟦 Xanh</Option>
                        <Option value="Yellow">🟨 Vàng</Option>
                        <Option value="Green">🟩 Xanh lá cây</Option>
                        <Option value="Purple">🟪 Tím</Option>
                        <Option value="Orange">🟧 Cam</Option>
                        {/* Thêm các tùy chọn màu khác nếu cần */}
                    </Select>
                </label>
            </div>
            <div className="listpro-one">
                {sortedAndFilteredCourses.slice(0, visibleCourses).map((course) => (
                    <div key={course.id}>
                        <div className='ty-contai'>
                            <div className="courseProgress">
                                <div className="imgCoureProgress">
                                    <img src={course.courseIMG[0]} alt="" />
                                </div>
                                <div className="infoCourseProgress">
                                    <h3 style={{ borderRadius: 50 }} className='bg-red-500 text-white w-9 p-1 '>New</h3>
                                    <a href={`/introduction/${course.id}`}>
                                        <h2>{course.courseName}</h2>
                                    </a>
                                    <div className='mt-4'>{formatCurrency(course.price)}</div>
                                    <div className="fl-info-progress mt-2">
                                        <div className="fl1-info-progress">
                                            <img
                                                className='mt-1'
                                                src="https://kingshoes.vn/data/upload/media/cua-hang-giay-sneaker-chinh-giay-uy-tin-nhat-den-king-shoes-authenti-hcm-2-1624430336.png"
                                                alt=""
                                            />
                                        </div>
                                        <div className="fl2-info-progress">My store - By: Trần Phùng</div>
                                    </div>
                                </div>
                            </div>
                            <div className="option-course-progress">
                                <div className="dropdown dropdown-right dropdown-end mt-5">
                                    <label tabIndex={0} className="btn m-1">
                                        <i className="fa-solid fa-ellipsis"></i>
                                    </label>
                                    <ul
                                        tabIndex={0}
                                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 right-0 mt-8"
                                    >
                                        <Button onClick={() => handleBookmarkClick(course.id)}>Thêm giỏ hàng</Button>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <hr />
                    </div>
                ))}
                {filteredCourses.length > visibleCourses && (
                    <button className="show-more-button font-bold" onClick={handleShowMore}>
                        Xem thêm
                    </button>
                )}
            </div>
        </div>
    );
};

export default ListCourse;
