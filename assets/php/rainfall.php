<?php
session_start();
include('database.php');

$response = array();

if ($con) {
    $sql = "SELECT * FROM rain_g";
    $result = mysqli_query($con, $sql);

    if ($result) {
        header("Content-Type: application/json");
        $totalVolume = 0; // Initialize totalVolume to 0
        while ($row = mysqli_fetch_assoc($result)) {
            // Check if volume is an integer
            if (ctype_digit($row['volume'])) {
                // If so, update the total volume
                $totalVolume += (int)$row['volume'];
            }
        }
        $response['totalVolume'] = $totalVolume; // Add total volume to response
        echo json_encode($response, JSON_PRETTY_PRINT);
    }
} else {
    echo "Database connection failed";
}
?>
