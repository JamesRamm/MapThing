#ifndef BRIDGE_H
#define BRIDGE_H

#include <QObject>
#include <QString>
#include <QWebElement>
#include <QDir>

class Bridge : public QObject
{
    Q_OBJECT
public:
    explicit Bridge(QObject *parent = 0);
    ~Bridge();

    //Q_INVOKABLE void getLastError();

signals:

    // Ask for a new set of exposures from jcalf db connection
    Q_INVOKABLE void refreshExposures(double minX, double minY, double maxX, double maxY);
    Q_INVOKABLE void connectDatabase(QString host, QString port, QString user, QString pwd);
    Q_INVOKABLE void computeHistogram(QString ptf);

    void exposureUpdated(double lat, double lng, double tiv);
    void progressUpdated(int percent);
    void databaseConnected(bool status);
    void workStarted();
    void workFinished();
    void error(QString err, QString title);
    void fileLoad(QString);
    void markerLoadingStats(int nLoaded, int nSkipped);
    void printRequest(QString path);
    void pageInitFinished();

public slots:

    void showOpenFileDialog();
    void showSaveFileDialog();
    void connectToPathField(const QWebElement &msg);
    void loadFile();

private:
     QWebElement msgSpan;
     QString lastFile;
     QDir lastDir;

};

#endif // BRIDGE_H