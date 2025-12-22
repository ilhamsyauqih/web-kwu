import React from 'react';
import Layout from '../components/Layout';

const About = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Tentang Gedebog Chips</h1>

                <div className="prose prose-lg text-gray-600 mx-auto">
                    <p className="mb-6">
                        Selamat datang di Gedebog Chips, tempat inovasi bertemu tradisi. Kami mengubah batang pisang (Gedebog)
                        yang sederhana menjadi camilan renyah dan gurih yang sulit untuk dilewatkan.
                    </p>
                    <p className="mb-6">
                        Perjalanan kami dimulai dengan ide sederhana: membuat camilan berkelanjutan menggunakan bahan-bahan lokal.
                        Dengan memanfaatkan batang pisang, kami tidak hanya menciptakan produk unik tetapi juga mengurangi limbah dan mendukung petani lokal.
                    </p>
                    <p>
                        Kami menawarkan berbagai rasa untuk memuaskan setiap selera, dari Original klasik hingga Balado pedas dan Keju gurih.
                        Terima kasih telah memilih Gedebog Chips!
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default About;
