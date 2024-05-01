document.addEventListener('DOMContentLoaded', function () {
    const chooseFiles = document.getElementById('choose-files');
    const mergeFiles = document.getElementById('merge-files')
    mergeFiles.style.display = 'none'
    mergeFiles.addEventListener('click', merger);
    const addFiles = document.getElementById('add-files');
    const fileZone = document.querySelector('.file-zone');

    const toggleButton = document.getElementById('toggle');
    let clickCount = 0;

    toggleButton.addEventListener('click', function () {
        clickCount++;

        // Calculate the color based on the click count
        let color1;
        let color2;
        switch (clickCount % 4) {
            case 1:
                color1 = 'rgb(219, 219, 47)'; // Yellow
                color2 = 'rgb(255, 255, 0)'; // Yellow
                break;
            case 2:
                color1 = 'rgb(218, 164, 65)';   // orange
                color2 = 'rgb(255, 166, 0)';   // orange
                break;
            case 3:
                color1 = 'rgb(81, 230, 81)'; // green
                color2 = 'rgb(0, 255, 0)'; // green
                break;
            default:
                color1 = 'rgb(50, 180, 231)'; // Original color
                color2 = 'rgb(10, 114, 155)'; // Original color
                clickCount = 0; // Reset click count for next cycle
        }

        // Update the CSS variable with the calculated color
        document.documentElement.style.setProperty('--theme', color1);
        document.documentElement.style.setProperty('--themeDark', color2);
    });

    const restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', function () {
        window.location.reload();
    })

    const downloadSection = document.getElementById('download-pdf');
    downloadSection.style.display = 'none'
    let allFiles = [];

    chooseFiles.addEventListener('click', chooseFile);
    addFiles.addEventListener('click', chooseFile);

    function chooseFile() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf';
        fileInput.multiple = false; // Allow only one file to be selected

        // Trigger file selection
        fileInput.click();

        // Handle file selection
        fileInput.addEventListener('change', handleFileSelection);
    }

    function handleFileSelection(event) {
        const selectedFile = event.target.files[0]; // Get the first selected file
        const selectedFiles = event.target.files; // Get the selected files
        allFiles.push(selectedFile)
        // Check if multiple files are selected
        if (allFiles.length > 1) {
            // Display the merge button
            mergeFiles.style.display = 'flex';
        } else {
            // Hide the merge button if only one file is selected
            mergeFiles.style.display = 'none';
        }

        // Check if a file is selected
        if (selectedFile) {
            // Check if the file type is PDF
            if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
                // Initialize PDF.js
                pdfjsLib.getDocument(URL.createObjectURL(selectedFile)).promise.then(function (pdf) {
                    // Load the first page
                    return pdf.getPage(1);
                }).then(function (page) {
                    // Set canvas for rendering
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale as needed

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render the page into canvas
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    return page.render(renderContext).promise.then(function () {
                        // Convert canvas to image
                        const thumbnail = new Image();
                        thumbnail.src = canvas.toDataURL();
                        thumbnail.alt = 'Thumbnail';
                        thumbnail.classList.add('thumbnail');

                        // Create uploaded file container
                        const uploadedFile = document.createElement('div');
                        uploadedFile.classList.add('uploaded-file')

                        // Create title element
                        const title = document.createElement('p');
                        title.textContent = trimFilename(selectedFile.name);
                        title.classList.add('file-title');

                        // Append thumbnail and title to uploaded file container
                        uploadedFile.appendChild(thumbnail);
                        uploadedFile.appendChild(title);
                        document.getElementById('choose-files').style.display = 'none'

                        // Append uploaded file container to file-zone
                        fileZone.appendChild(uploadedFile);
                    });
                }).catch(function (error) {
                    console.error('Error occurred:', error);
                });
            } else {
                alert("Please choose a PDF file.");
            }
        } else {
            alert("Please choose a file.");
        }

        // Clear the file input value to allow selecting the same file again
        event.target.value = '';
    }

    // Function to trim filename and add '...' if it exceeds a certain length
    function trimFilename(filename) {
        const maxLength = 20; // Maximum length of the filename
        if (filename.length > maxLength) {
            return filename.substring(0, maxLength - 3) + '...';
        }
        return filename;
    }

    function merger() {
        // Check if there are selected files
        if (allFiles.length === 0) {
            alert("Please select files to merge.");
            return;
        }

        // Create FormData object to send files
        const formData = new FormData();
        allFiles.forEach(file => {
            formData.append('files', file);
        });

        // Send AJAX request to Flask backend
        fetch('/merge', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                // Handle response
                if (response.ok) {
                    // Redirect or handle the merged PDF file
                    // For example, you can redirect to a download link
                    // window.location.href = response.url;
                    downloadSection.style.display = 'flex'

                    // Display the name of the merged file
                    const mergedFileName = document.querySelector('.file-name');
                    mergedFileName.textContent = 'ypdf_merged.pdf';
                } else {
                    alert('Failed to merge files.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to merge files.');
            });
    }



});


