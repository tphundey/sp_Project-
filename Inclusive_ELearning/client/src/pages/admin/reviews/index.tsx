import { useGetProductsQuery } from "@/api/courses";
import { useGetReviewsQuery } from "@/api/review";
import { useGetUsersQuery } from "@/api/user";
import { Button, Table, Skeleton, message, Pagination, Rate, Modal } from "antd";
import { useState } from "react";

const AdminReview = (props: any) => {
    const [messageApi, contextHolder] = message.useMessage();
    const { data: reviewData, isLoading: isProductLoading } = useGetReviewsQuery();
    const { data: usersData } = useGetUsersQuery();
    const { data: courseData } = useGetProductsQuery();
    const dataSource = reviewData?.map((item: any, index: number) => ({
        key: item.id,
        stt: (index + 1).toString(),
        rating: item.rating,
        comment: item.comment,
        userID: item.userID,
        productImage: courseData?.find((course: any) => course.id === item.courseID)?.courseIMG,
        courseID: item.courseID,
        date: item.date
    }));

    const userMap = new Map(usersData?.map((item: any) => [item.id, item.displayName]));
    const categoryMap = new Map(courseData?.map((item: any) => [item.id, item.courseName]));

    const [userDetailVisible, setUserDetailVisible] = useState(false);
    const [currentUserDetail, setCurrentUserDetail] = useState<any>(null);

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: 'Rate',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating: any) => (
                <Rate disabled allowHalf defaultValue={rating} />
            ),
        },
        {
            title: "Nội dung",
            dataIndex: "comment",
            key: "comment",
        },
        {
            title: "Tên người dùng",
            dataIndex: "userID",
            key: "userID",
            render: (userID: string) => {
                const displayName = userMap.get(userID);
                return displayName;
            },
        },
        {
            title: "Thông tin người dùng",
            dataIndex: "userID",
            key: "userDetail",
            render: (userID: string) => (
                <Button type="link" onClick={() => showUserDetail(userID)}>Chi tiết</Button>
            ),
        },
        {
            title: "Sản phẩm",
            dataIndex: "courseID",
            key: "courseID",
            render: (courseID: string) => {
                const categoryName = categoryMap.get(courseID);
                return categoryName;
            },
        },
        {
            title: "Hình ảnh",
            dataIndex: "courseID",
            key: "courseID",
            render: (courseID: string, record: any) => (
                <>
                    <img src={record.productImage} alt="Product" style={{ width: '50px', height: 'auto', marginRight: '10px' }} />
                    {record.productName}
                </>
            ),
        }
    ];

    const showUserDetail = (userID: string) => {
        const userDetail = usersData.find((user: any) => user.id === userID);
        if (userDetail) {
            setCurrentUserDetail(userDetail);
            setUserDetailVisible(true);
        }
    };

    const handleCancel = () => {
        setUserDetailVisible(false);
    };

    const pageSize = 4;
    const [currentPage, setCurrentPage] = useState(1);
    const handlePageChange = (page: any) => {
        setCurrentPage(page);
    };
    const startItem = (currentPage - 1) * pageSize;
    const endItem = currentPage * pageSize;
    const currentData = dataSource?.slice(startItem, endItem);

    return (
        <div>
            <header className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Quản lý Đánh giá</h2>
            </header>
            {contextHolder}
            {isProductLoading ? <Skeleton /> : (
                <>
                    <Table
                        pagination={false}
                        dataSource={currentData}
                        columns={columns}
                    />
                    <Pagination
                        className="mt-4"
                        current={currentPage}
                        total={dataSource?.length}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                    />
                    <Modal
                        title="Thông tin người dùng"
                        visible={userDetailVisible}
                        onCancel={handleCancel}
                        footer={null}
                    >
                        {currentUserDetail && (
                            <div>
                                <p><strong>Tên người dùng:</strong> {currentUserDetail.displayName}</p>
                                <p><strong>Email:</strong> {currentUserDetail.email}</p>
                                <p><strong>Số điện thoại:</strong> {currentUserDetail.phone}</p>
                            </div>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
};

export default AdminReview;
