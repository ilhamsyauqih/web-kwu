import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <h3 className="text-lg font-bold text-primary-dark">Gedebog Chips</h3>
                        <p className="text-sm text-gray-500">Keripik gedebog pisang lezat di setiap gigitan.</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Gedebog Chips. Hak cipta dilindungi.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
