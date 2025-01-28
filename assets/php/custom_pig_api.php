<?php
// Include database connection
include('database.php');

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch data from the pig_farms table
    $sql = "SELECT * FROM pig_farms";
    $stmt = $con->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if there are no markers
    if ($result->num_rows == 0) {
        echo json_encode(array('error' => 'No markers found'));
        exit;
    }

    // Process marker data
    $response = array();
    while ($row = $result->fetch_assoc()) {
        $response[] = array(
            'farm_name' => $row['farm_name'],
            'sow_count' => $row['sow_count'],
            'boar_count' => $row['boar_count'],
            'fattener_count' => $row['fattener_count'],
            'piglet_count' => $row['piglet_count'],
            'native_count' => $row['native_count'],
            'sanitation' => $row['sanitation'], // Include sanitation field
            'latitude' => $row['latitude'],
            'longitude' => $row['longitude'],
            'municipality_code' => $row['municipality_code'],
            'discharge' => $row['discharge']
        );
    }

    // Output marker data
    header("Content-Type: application/json");
    echo json_encode($response, JSON_PRETTY_PRINT);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') { // Check if the request method is DELETE
    // Get the farm name from the request body
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['farmName'])) {
        // Prepare and execute the SQL DELETE statement
        $farmName = $data['farmName'];
        $stmt = $con->prepare("DELETE FROM pig_farms WHERE farm_name=?");
        $stmt->bind_param('s', $farmName);
        if ($stmt->execute()) {
            // Return success message
            echo json_encode(array('message' => 'Data deleted successfully'));
        } else {
            // Return error message
            echo json_encode(array('error' => 'Failed to delete data: ' . $con->error));
        }
    } else {
        // Return error if farm name is not provided
        echo json_encode(array('error' => 'Farm name not provided'));
    }
} else {
    // Return error if method is not GET or DELETE
    echo json_encode(array('error' => 'Invalid request method'));
}
?>
