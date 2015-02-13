/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//package fileserch;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author rukshan
 */
public class FileCount {

    public static int cnt = 0;
    public static String path;
    public static ArrayList<String> filelist = new ArrayList<String>();

    public static void main(String[] args) {
        File f = new File(".");
        path=f.getAbsolutePath();
        System.out.println(path);
        print(f);
        System.out.println(cnt);
        write();
    }

    public static void print(File f) {
        File[] list = f.listFiles();
        for (int i = 0; i < list.length; i++) {
            File fi = list[i];
            if (fi.isHidden()) {
                continue;
            }

            if (fi.isDirectory()) {
                print(fi);
            } else {
                String fname = fi.getAbsolutePath().replace(path, ".");
                if ("./index.html".equals(fname)) {
                    fname = "/index.html";
                }
                filelist.add(fname);
                cnt++;
            }
        }
    }

    public static void write() {
        try {
            FileWriter writer = new FileWriter("cache.manifest");
            writer.write("CACHE MANIFEST" + "\n");
            writer.write("# rev 306" + "\n");
            writer.write("CACHE:" + "\n");
            for (String string : filelist) {
                writer.write(string + "\n");
            }
            writer.close();
        } catch (IOException ex) {
            System.out.println("ex = " + ex);
        }
    }
}
