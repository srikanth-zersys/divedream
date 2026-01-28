import React from 'react';

const Footer = () => {
  const brandName = process.env.BRAND_NAME;

  return (
    <React.Fragment>
      <div className="main-footer">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-1">
            <div className="text-center text-gray-500 dark:text-dark-500 ltr:lg:text-center rtl:lg:text-center">
              <div>
                v0.1.0 &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Footer;
