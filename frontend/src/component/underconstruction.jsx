

const UnderConstruction = () => {
  return (
    <div className="hero min-h-screen bg-base-200" data-theme="cmyk">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">We're Building Something Awesome!</h1>
          <p className="py-6">
            Our backend is all set and firing on all cylinders. We're now working hard to create a beautiful and user-friendly frontend experience for you.
          </p>

          <div className="my-8">
            <h2 className="text-2xl font-semibold mb-4">Project Status</h2>
            <div className="space-y-4">
              <div>
                <p className="flex justify-between">
                  <span>Backend</span>
                  <span>100%</span>
                </p>
                <progress className="progress progress-success w-full" value="100" max="100"></progress>
              </div>
              <div>
                <p className="flex justify-between">
                  <span>Frontend</span>
                  <span>In Progress</span>
                </p>
                <progress className="progress progress-info w-full" value="30" max="100"></progress>
              </div>
            </div>
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;