import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Modal, Button, message } from 'antd';
import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { firebaseConfig } from '@/components/GetAuth/firebaseConfig';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Profile = () => {
    const { id } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAddress, setNewAddress] = useState("");
    const [newPhoneNumber, setNewPhoneNumber] = useState("");
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
        // Fetch profile data when id changes
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/googleAccount`);
                const data = await response.json();
                // Lọc ra object có userId trùng với id trong URL của client
                const userProfile = data.find(item => item.userId === id);
                if (userProfile) {
                    setProfileData(userProfile);
                } else {
                    console.error("User profile not found");
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        if (id) {
            fetchProfileData();
        }
    }, [id]);

    console.log(userId);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    useEffect(() => {
        // Fetch profile data when id changes
        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/googleAccount`);
                const data = await response.json();
                // Lọc ra object có userId trùng với id trong URL của client
                const userProfile = data.find(item => item.userId === id);
                if (userProfile) {
                    setProfileData(userProfile);
                    // Initialize newAddress and newPhoneNumber with existing data
                    setNewAddress(userProfile.address || "");
                    setNewPhoneNumber(userProfile.phone || "");
                } else {
                    console.error("User profile not found");
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        if (id) {
            fetchProfileData();
        }
    }, [id]);
    const updateProfile = async () => {
        try {
            const response = await fetch(`http://localhost:3000/googleAccount/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: newAddress,
                    phone: newPhoneNumber
                })
            });

            if (response.ok) {
                // If update is successful, update the profile data
                const updatedProfileData = { ...profileData };
                updatedProfileData.address = newAddress;
                updatedProfileData.phone = newPhoneNumber;
                setProfileData(updatedProfileData);

                message.success('Profile updated successfully!'); // Display success message
            } else {
                console.error("Failed to update profile.");
                message.error('Failed to update profile.'); // Display error message
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Error updating profile.'); // Display error message
        }
    };

    return (
        <>
            <div className="flex space-x-8 h-full bg-gray-200 p-8 pl-20 pr-20">
                <div>
                    <div className="bg-white rounded-lg shadow-xl pb-8  mt-20">
                        {/* Profile information */}
                        <div className="flex flex-col -mt-20 pl-10">
                            {/* Profile picture and basic info */}
                            <div className="w-40 h-40 z-[1]">
                                {user?.photoURL && <img src={user?.photoURL} className="object-cover w-full h-full block border-4 border-white rounded-full" />}
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                                <p className="text-2xl">Họ và Tên: {user?.displayName}</p>
                            </div>
                            <p className="text-gray-700">Email: {user?.email}
                                <span onClick={showModal} className="tran">
                                    <a href="#" className="underline text-blue-500 ml-3 mr-4">Thông tin liên hệ</a>
                                </span>
                            </p>
                        </div>

                        {/* Additional profile information */}
                        <div className="flex-1 flex flex-col px-8 mt-2">
                           
                        </div>
                    </div>

                    {/* Modal for contact information */}
                    <Modal title={`${user?.displayName}`} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                        {/* Contact information */}
                        <hr className="pb-5" />
                        <p className="text-black text-xl pb-2">Thông tin liên hệ</p>
                        <div className="text-l flex item-center">
                            <div className="w-10"><UserOutlined /> </div>
                            <div>
                                <h5>Trang cá nhân của bạn</h5>
                                <a href="#" className="underline text-blue-500">{user?.email}</a>
                            </div>
                        </div>
                        <div className="text-l flex item-center">
                            <div className="w-10"><MailOutlined /> </div>
                            <div>
                                <h5>Email</h5>
                                <a href="#" className="underline text-blue-500">{user?.email}</a>
                            </div>
                        </div>
                    </Modal>
                </div>

                {/* Additional information */}
                <div className="flex flex-col justify-center items-center h-full">
                    <div className="!z-5 relative flex flex-col rounded-lg bg-white bg-clip-border p-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:shadow-none">
                        <div className="border-b border-black border-zinc-300 flex w-full items-center justify-between bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                            <div className="flex items-center">
                                <div className="ml-4">
                                    <p className="text-base font-medium text-navy-700 dark:text-white">
                                        Profile language
                                    </p>
                                    <p className="mt-2 text-sm text-gray-600">
                                        English
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form for updating address and phone number */}
                        <div className="mt-3 flex w-full border-zinc-300 items-center justify-between bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
                            <div className="flex items-center">
                                <div className="ml-4">
                                    <label htmlFor="newAddress">Địa chỉ của tôi: </label>
                                    <input
                                        type="text"
                                        id="newAddress"
                                        value={newAddress}
                                        onChange={(e) => setNewAddress(e.target.value)}
                                    />
                                </div>
                                <div className="ml-4">
                                    <label htmlFor="newPhoneNumber">Số điện thoại: </label>
                                    <input
                                        type="text"
                                        id="newPhoneNumber"
                                        value={newPhoneNumber}
                                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                                    />
                                </div>
                           <br />
                           
                                <button onClick={updateProfile} className="hover:text-white rounded-lg text-sm space-x-2 transition duration-100 border-blue-700 border p-2 bg-blue-400 text-white">Cập nhật thông tin</button>
                     
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
