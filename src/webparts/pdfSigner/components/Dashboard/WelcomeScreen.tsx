import * as React from 'react';
import styles from './WelcomeScreen.module.scss';
import {
    MdMail,
    MdPayments,
    MdSupportAgent,
    MdSchool,
    MdDescription,
    MdApartment
} from 'react-icons/md';

export interface IWelcomeScreenProps {
    userDisplayName: string;
}

export const WelcomeScreen: React.FunctionComponent<IWelcomeScreenProps> = (props) => {
    return (
        <div className={styles.welcomeScreen}>
            <main>
                <div className={styles.container}>
                    {/* Hero Section */}
                    <div className={styles.heroGrid}>
                        <div className={`${styles.card} ${styles.largeCard}`}>
                            <div className={styles.bgImage} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAfrHnYyD-3atxv6tCsRFyy5o66cMG1qoEhLI5gBMfZ7jttKHg4SAcVJURiHKp3aL7E1wTJB1ET_aGS1EwH5RP6JmAHXua-3YzByzlL13ms_UsIRqs889gZLVScBGvVtVyKBT5rc9sgvl4blcKP9ceR-hICgaYspSouZzaMvQtzQGhQttx6_6v3fMkyEkLi63rSPL_Sv5NtxHDBYJo5hM7eedAyFfD-VyaO19kRvSB8PZgRzZcpPdywgwtLjXaJDTBbyaQ5c5AlDE4")` }}></div>
                            <div className={styles.overlayGradient}></div>
                            <div className={styles.content}>
                                <span className={styles.badge}>Tin nổi bật</span>
                                <h1>Chào mừng đến với Cổng thông tin nội bộ mới</h1>
                                <p>Khám phá trải nghiệm cộng tác hiện đại, giúp bạn kết nối với đồng nghiệp và tài nguyên nhanh chóng hơn bao giờ hết.</p>
                                <button>Xem chi tiết</button>
                            </div>
                        </div>
                        <div className={`${styles.card} ${styles.mediumCard}`}>
                            <div className={styles.bgImage} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCgWF4kBPwG1jEaQauo_uWZf2N99TlPhiIUH8V2UmJcHpiTGHEtujYDaEb8I1l8r2tDwx9_g5OiqOntWyblarAi_ttlWohvb1GdrdtVM0-a8Bh5gOmVctd5-FIS_NXsvoZD76qYVi5VUiVAYHqBFyq0R_Egqop_B15t8IkaH3CELKIA4lttS_aMJFTEZjOCAvClY3V-u_WSXnivu9swJpNMGgG4WK-5fc9B74cvGctei4MCoapjA9WL-UlmHQy7838VTmkLIX0n-Mc")` }}></div>
                            <div className={styles.overlay}></div>
                            <div className={styles.content}>
                                <h3>Bản tin tháng 10: Những thành tựu mới</h3>
                                <p>Cập nhật những bước tiến quan trọng trong quý vừa qua.</p>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.bgImage} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCJgtv62X7OsKwsmfHed9eXgLEsaIp-Qz-tc8I2YAZK7iS_t3fwyFFn5ZrjEK3HZ3zeC8fxdKEmUOUDruRFhOxjGqT57uxRNZVxPubMD0vkM6kzmY1Zb8f8BJmquHi2wWAQqyVJn7pGYcRToYs_t2rgCObmI_PiqyOl66GbwHzrdKtEN9CghiVjMba98FGfc3DcXCM68dMuzfGBzGYW6Rpax-bCPDlBFKiSOwkLbACUxmZvA7-oALmURi_I8TSBHxorAridGaBbJtk")` }}></div>
                            <div className={styles.overlay}></div>
                            <div className={styles.content}>
                                <h3 className={styles.small}>Quy định làm việc</h3>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.bgImage} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWfgYO6Xmy56rwMIkMRbF34oS2Zl7HJq5mK3VvCe2ZP0Okl4VOuXYQUWy9S5sj7iazrXTLwFMXGcqC5ll_aD-HODzgcafLjcLXaqDgYiHImeAVZWB6NXNMv_3jKpu1kxGWG6uIJc4qbJ2vkvcHmqysnuKC-d4nyiLrsBtUFM1G2yC6wzIiJJstl1DZ5eqSm669oMKdNtuFIPAP--oTNolbT8EexEqDjKP68aJVOoIvGNyLEwgqDIHo7ETEx7oqwjt3xY-wFpJ1D_U")` }}></div>
                            <div className={styles.overlay}></div>
                            <div className={styles.content}>
                                <h3 className={styles.small}>Vinh danh nhân viên</h3>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className={styles.contentGrid}>
                        {/* News Column */}
                        <div className={styles.leftColumn}>
                            <div className={styles.sectionHeader}>
                                <h2>Tin tức công ty</h2>
                                <a href="#">Xem tất cả</a>
                            </div>
                            <div className={styles.newsGrid}>
                                {/* News 1 */}
                                <div className={styles.newsCard}>
                                    <div className={styles.thumbnail} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuANBmXhsFErBMhHyH1oyYFq91f6coQ3EuiA2agWpDbJXG2mdPD0cNfEURgx7XUrS_KLeFhfpfGVoin_7qDIXXRWX38K9Ify7-DR-0x7hkYqnJABUEQtGsLOjn0Q7h8UQ3vHLaficwMbWpiMOLex5QPnU4l_t3sFSn-B5BmGgJ51TnfdSaw9n0FeYWT_oBqsroewPKVoE9vRkBjWuTllIcfQVe2kJQN-RbJoSghBCKdaQWIhWs7k6NGllp1YCQj36j2Y6ayGd45uIbk")` }}></div>
                                    <div className={styles.meta}>
                                        <span className={styles.category}>Sự kiện</span>
                                        <h4>Kỷ niệm 10 năm thành lập tập đoàn</h4>
                                        <span className={styles.date}>25/10/2023 • 5 phút đọc</span>
                                        <p className={styles.excerpt}>Cùng nhìn lại chặng đường 10 năm phát triển và những cột mốc đáng nhớ mà chúng ta đã đạt được.</p>
                                    </div>
                                </div>
                                {/* News 2 */}
                                <div className={styles.newsCard}>
                                    <div className={styles.thumbnail} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBPAd7BS9ih7OJ7q-pRTX_749_aL1Paumqedh_ZkZ1y8teW8Wt07q-aCTPfokmw2njLgAF8_YyJUBxdYMdTozx-NxpQYLdTXzA3P8LvmubGW0_8npzcxJzIHirg8R6vk-msSQXGnZSlqihXIz-3XlAPLOYfgw9hDp9oRSJI6Mq6mxEuWSTHlo7l5rZujVja3E38J0kJCn9kb0sq5O3nfERdvd_Y0Hp97sUzkT3aelvH9CvYehUW8PEph0Yy4iReMzHpeyhkioSjXVU")` }}></div>
                                    <div className={styles.meta}>
                                        <span className={styles.category}>Nhân sự</span>
                                        <h4>Chính sách làm việc linh hoạt mới</h4>
                                        <span className={styles.date}>20/10/2023 • 3 phút đọc</span>
                                        <p className={styles.excerpt}>Bắt đầu từ tháng sau, công ty sẽ áp dụng mô hình Hybrid Working cho toàn bộ khối văn phòng.</p>
                                    </div>
                                </div>
                                {/* News 3 */}
                                <div className={styles.newsCard}>
                                    <div className={styles.thumbnail} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBTXZirMGISTxuaCsjT4FH2-0Iltj2HA8LvQMGrQDypVvfOa7SdaMLZhHcjquikwwEOslkVYs2IlvkNz8pYtAoug2cN6RVXNH21r4ccvdKPlOsTTXIHmNlj2Sq9oLjSV5n7N22A52sfqToT9Qde6_lrngq99avvJJHCzuTkCq_RLpP6w6OcrDjQE0EEucrVKhMhhfdbB4Jo8GKudnzSVpp_6aUfPILOw9I_JJwTMIOPjgc25L6zXMhk3PlfC_mR-TuZCG9hZUTf7v8")` }}></div>
                                    <div className={styles.meta}>
                                        <span className={styles.category}>Công nghệ</span>
                                        <h4>Ra mắt hệ thống quản lý dự án ERP</h4>
                                        <span className={styles.date}>18/10/2023 • 8 phút đọc</span>
                                        <p className={styles.excerpt}>Hướng dẫn chi tiết về cách sử dụng hệ thống ERP mới để tối ưu hóa quy trình làm việc.</p>
                                    </div>
                                </div>
                                {/* News 4 */}
                                <div className={styles.newsCard}>
                                    <div className={styles.thumbnail} style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRw1DOTa84XvzjDwGdEzngJ0Du7FkogN6duPuUA8J5KPYAE6Tli-zWxc6_-fXEKhV7hZgXeKL1YsS340KTMad9GRZnOSLUFfo88_psc_2eK2XgBarq-c_kClzlt7Xna_lWfmozGhgwZsV7boOojYWxTYIAUjBh2ikLiwQoylDXL28CTHRAkXN2P3_1qmpxy7y2ofEgsQe64k3SPhwZyuzjPVMAOtDMK6gRcQpdhCMjL2sWWB96-_3Mp2FzXyRZTFD0s2eTXYHX9qU")` }}></div>
                                    <div className={styles.meta}>
                                        <span className={styles.category}>Cộng đồng</span>
                                        <h4>Giải chạy thiện nguyện "Chạy vì cộng đồng"</h4>
                                        <span className={styles.date}>15/10/2023 • 2 phút đọc</span>
                                        <p className={styles.excerpt}>Đăng ký tham gia ngay để cùng nhau lan tỏa yêu thương và rèn luyện sức khỏe.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className={styles.rightColumn}>
                            <div className={styles.sectionHeader}>
                                <h2>Liên kết nhanh</h2>
                            </div>
                            <div className={styles.quickLinksGrid}>
                                <a href="#" className={styles.linkCard}>
                                    <MdMail />
                                    <span>Email (Outlook)</span>
                                </a>
                                <a href="#" className={styles.linkCard}>
                                    <MdPayments />
                                    <span>Bảng lương</span>
                                </a>
                                <a href="#" className={styles.linkCard}>
                                    <MdSupportAgent />
                                    <span>Hỗ trợ IT</span>
                                </a>
                                <a href="#" className={styles.linkCard}>
                                    <MdSchool />
                                    <span>Đào tạo</span>
                                </a>
                                <a href="#" className={styles.linkCard}>
                                    <MdDescription />
                                    <span>Biểu mẫu HR</span>
                                </a>
                                <a href="#" className={styles.linkCard}>
                                    <MdApartment />
                                    <span>Sơ đồ tổ chức</span>
                                </a>
                            </div>

                            <div className={styles.sectionHeader}>
                                <h2>Sự kiện sắp tới</h2>
                            </div>
                            <div className={styles.eventsList}>
                                <div className={styles.eventCard}>
                                    <div className={styles.dateBox}>
                                        <span className={styles.month}>TH10</span>
                                        <span className={styles.day}>28</span>
                                    </div>
                                    <div className={styles.info}>
                                        <h4>Họp toàn thể quý (Townhall)</h4>
                                        <p>14:00 - 16:00 • Phòng họp 101</p>
                                    </div>
                                </div>
                                <div className={styles.eventCard}>
                                    <div className={styles.dateBox}>
                                        <span className={styles.month}>TH11</span>
                                        <span className={styles.day}>02</span>
                                    </div>
                                    <div className={styles.info}>
                                        <h4>Đào tạo An toàn thông tin</h4>
                                        <p>09:00 - 11:30 • Trực tuyến</p>
                                    </div>
                                </div>
                                <div className={styles.eventCard}>
                                    <div className={styles.dateBox}>
                                        <span className={styles.month}>TH11</span>
                                        <span className={styles.day}>05</span>
                                    </div>
                                    <div className={styles.info}>
                                        <h4>Team Building Friday</h4>
                                        <p>16:30 - 18:00 • Khu vực sinh hoạt chung</p>
                                    </div>
                                </div>
                                <button className={styles.viewAllBtn}>Xem toàn bộ lịch</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <div className={styles.footerContent}>
                    <div className={styles.copyright}>
                        <svg fill="none" width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                        <p>© 2023 SharePoint Intranet. All rights reserved.</p>
                    </div>
                    <div className={styles.links}>
                        <a href="#">Chính sách bảo mật</a>
                        <a href="#">Điều khoản sử dụng</a>
                        <a href="#">Trợ giúp</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
